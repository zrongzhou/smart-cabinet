#!/bin/bash
# ============================================================
#  Smart Cabinet — Git Pre-Commit Hook
#  防止遗漏关键文件的"低级错误"再次发生
#  
#  触发时机: 每次 git commit 前
#  检查项:
#    1. API 路由文件完整性 (src/app/api/)
#    2. i18n 翻译文件完整性 (messages/)
#    3. 关键目录未跟踪文件检测
#    4. 关键配置文件存在性
#
#  2026-06-27 创建 — v129 事故后补救措施
# ============================================================

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BOLD='\033[1m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo -e "${BOLD}🔍 Smart Cabinet Pre-Commit 检查${NC}"
echo "======================================"

# ---- 1. API 路由文件检查 ----
echo ""
echo -e "${BOLD}[1/4] API 路由文件完整性${NC}"

API_DIR="src/app/api"
if [ ! -d "$API_DIR" ]; then
  echo -e "${RED}❌ 致命: $API_DIR 目录不存在！整个 API 层可能缺失。${NC}"
  ERRORS=$((ERRORS + 1))
else
  API_FILE_COUNT=$(find "$API_DIR" -name "route.ts" -o -name "route.js" 2>/dev/null | wc -l)
  if [ "$API_FILE_COUNT" -lt 25 ]; then
    echo -e "${RED}❌ 致命: API 路由文件过少 ($API_FILE_COUNT 个)，预期至少 25 个！上次事故就是 37 个 API 文件未提交。${NC}"
    echo -e "${RED}   缺失的文件可能包括: settings, products, blogs, media, contact, custom-dimensions 等${NC}"
    ERRORS=$((ERRORS + 1))
    
    echo -e "${YELLOW}   当前 API 文件列表:${NC}"
    find "$API_DIR" -name "route.ts" -o -name "route.js" 2>/dev/null | head -30
  else
    echo -e "${GREEN}✅ API 路由文件完整: $API_FILE_COUNT 个 route 文件${NC}"
  fi
  
  # 检查关键 API 是否存在
  CRITICAL_APIS=(
    "src/app/api/settings/route.ts"
    "src/app/api/products/route.ts"
    "src/app/api/blogs/route.ts"
    "src/app/api/media"
    "src/app/api/admin/settings/route.ts"
    "src/app/api/admin/custom-dimensions/route.ts"
    "src/app/api/dimension-labels/route.ts"
    # 注意: contact API 可能不存在（通过其他方式处理），非必须
  )
  
  for api_path in "${CRITICAL_APIS[@]}"; do
    if [ ! -e "$api_path" ]; then
      echo -e "${RED}❌ 关键 API 缺失: $api_path${NC}"
      ERRORS=$((ERRORS + 1))
    fi
  done
fi

# ---- 2. i18n 翻译文件检查 ----
echo ""
echo -e "${BOLD}[2/4] i18n 翻译文件完整性${NC}"

MESSAGES_DIR="messages"
if [ ! -d "$MESSAGES_DIR" ]; then
  echo -e "${YELLOW}⚠️  警告: messages/ 目录不存在（可能使用其他 i18n 方案）${NC}"
  WARNINGS=$((WARNINGS + 1))
else
  for lang_file in en.json zh.json ar.json; do
    if [ -f "$MESSAGES_DIR/$lang_file" ]; then
      LINE_COUNT=$(wc -l < "$MESSAGES_DIR/$lang_file")
      if [ "$lang_file" = "en.json" ] && [ "$LINE_COUNT" -lt 80 ]; then
        echo -e "${RED}❌ $lang_file 行数异常少 ($LINE_COUNT 行)，预期至少 80 行！上次事故 en.json 只有 12 行。${NC}"
        ERRORS=$((ERRORS + 1))
      elif [ "$LINE_COUNT" -lt 10 ]; then
        echo -e "${YELLOW}⚠️  $lang_file 行数偏少 ($LINE_COUNT 行)${NC}"
        WARNINGS=$((WARNINGS + 1))
      else
        echo -e "${GREEN}✅ $lang_file: $LINE_COUNT 行${NC}"
      fi
    else
      echo -e "${YELLOW}⚠️  $lang_file 不存在 (可选)${NC}"
    fi
  done
fi

# ---- 3. 未跟踪关键文件检测 ----
echo ""
echo -e "${BOLD}[3/4] 未跟踪关键文件检测${NC}"

# 获取 git 状态中的未跟踪文件
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null || true)

if [ -n "$UNTRACKED" ]; then
  # 检查是否有源代码文件未被跟踪
  UNTRACKED_SRC=$(echo "$UNTRACKED" | grep -E '\.(ts|tsx|js|jsx|css|json|prisma)$' || true)
  UNTRACKED_SRC_COUNT=$(echo "$UNTRACKED_SRC" | grep -c . || true)
  
  if [ "$UNTRACKED_SRC_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $UNTRACKED_SRC_COUNT 个未跟踪的源代码文件:${NC}"
    echo "$UNTRACKED_SRC" | head -20
    
    # 特别关注关键目录
    UNTRACKED_IN_API=$(echo "$UNTRACKED_SRC" | grep "^src/app/api/" || true)
    UNTRACKED_IN_COMPONENTS=$(echo "$UNTRACKED_SRC" | grep "^src/components/" || true)
    UNTRACKED_IN_MESSAGES=$(echo "$UNTRACKED_SRC" | grep "^messages/" || true)
    
    if [ -n "$UNTRACKED_IN_API" ]; then
      echo -e "${RED}❌ 有 API 目录下的文件未跟踪！这是之前导致全站崩溃的原因！${NC}"
      echo "$UNTRACKED_IN_API"
      ERRORS=$((ERRORS + 1))
    fi
    if [ -n "$UNTRACKED_IN_COMPONENTS" ]; then
      echo -e "${YELLOW}⚠️  components 目录下有未跟踪文件${NC}"
      WARNINGS=$((WARNINGS + 1))
    fi
    if [ -n "$UNTRACKED_IN_MESSAGES" ]; then
      echo -e "${RED}❌ 有翻译文件未跟踪！可能导致页面显示 i18n key 原文！${NC}"
      ERRORS=$((ERRORS + 1))
    fi
  else
    echo -e "${GREEN}✅ 无未跟踪的源代码文件${NC}"
  fi
else
  echo -e "${GREEN}✅ 无未跟踪文件${NC}"
fi

# ---- 4. 关键配置文件检查 ----
echo ""
echo -e "${BOLD}[4/4] 关键配置文件存在性${NC}"

CRITICAL_FILES=(
  "next.config.mjs"
  "tailwind.config.ts"
  "package.json"
  "prisma/schema.prisma"
  "src/app/globals.css"
  "src/lib/i18n.tsx"
)

for f in "${CRITICAL_FILES[@]}"; do
  if [ -f "$f" ]; then
    echo -e "${GREEN}✅ $f${NC}"
  else
    echo -e "${RED}❌ 关键文件缺失: $f${NC}"
    ERRORS=$((ERRORS + 1))
  fi
done

# ---- 结果汇总 ----
echo ""
echo "======================================"

if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}${BOLD}❌ 检查失败: $ERRORS 个错误, $WARNINGS 个警告${NC}"
  echo -e "${RED}请先修复以上错误再提交。这些检查是为了避免 v129 式的全站崩溃事故。${NC}"
  echo -e "${RED}如需跳过检查（不推荐）: git commit --no-verify${NC}"
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}${BOLD}⚠️  通过（有警告）: $WARNINGS 个警告${NC}"
  echo -e "${YELLOW}建议修复警告后再提交，但不阻止本次提交。${NC}"
  exit 0
else
  echo -e "${GREEN}${BOLD}✅ 全部检查通过！可以安全提交。${NC}"
  exit 0
fi
