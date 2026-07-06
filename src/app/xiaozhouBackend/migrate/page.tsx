'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DataMigrationPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  // 导出数据
  const handleExport = () => {
    setExporting(true);
    
    const keys = [
      'admin_products',
      'admin_blogs',
      'admin_faqs',
      'admin_categories',
      'admin_tags',
      'admin_settings',
      'admin_custom_dimensions'
    ];
    
    const result: Record<string, any> = {};
    keys.forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          result[key] = JSON.parse(raw);
        } catch(e) {
          console.warn(`解析 ${key} 失败:`, e);
        }
      }
    });
    
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-cabinet-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExporting(false);
    alert('✅ 导出完成！文件已下载');
  };

  // 导入数据
  const handleImport = async () => {
    if (!file) {
      alert('请先选择文件');
      return;
    }

    setImporting(true);
    setImportResult('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          // 调用导入 API
          const response = await fetch('/api/admin/migrate/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await response.json();
          
          if (response.ok) {
            setImportResult(`✅ 导入成功！\n${result.message}`);
          } else {
            setImportResult(`❌ 导入失败：${result.error}`);
          }
        } catch (err: any) {
          setImportResult(`❌ 解析文件失败：${err.message}`);
        } finally {
          setImporting(false);
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      setImportResult(`❌ 导入失败：${err.message}`);
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/xiaozhouBackend')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 返回
            </button>
            <h1 className="text-2xl font-bold text-gray-900">数据迁移</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">📦 数据迁移说明</h2>
          <p className="text-sm text-blue-800 mb-2">
            此页面帮助您从浏览器本地存储（localStorage）迁移数据到 PostgreSQL 数据库。
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>点击"导出数据"按钮，下载当前本地存储的所有数据（JSON 文件）</li>
            <li>选择刚下载的 JSON 文件，点击"导入数据"按钮，将数据写入数据库</li>
            <li>导入完成后，刷新页面，数据将从数据库读取</li>
          </ol>
        </div>

        {/* 导出卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📥 导出数据</h3>
              <p className="text-sm text-gray-600 mb-4">
                从浏览器本地存储导出所有数据（产品、博客、FAQ、分类、标签、设置等）
              </p>
              <div className="text-xs text-gray-500">
                <p>将导出以下数据：</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>产品 (admin_products)</li>
                  <li>博客 (admin_blogs)</li>
                  <li>FAQ (admin_faqs)</li>
                  <li>分类 (admin_categories)</li>
                  <li>标签 (admin_tags)</li>
                  <li>网站设置 (admin_settings)</li>
                  <li>自定义维度 (admin_custom_dimensions)</li>
                </ul>
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="ml-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting ? '导出中...' : '📥 导出数据'}
            </button>
          </div>
        </div>

        {/* 导入卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📤 导入数据</h3>
              <p className="text-sm text-gray-600 mb-4">
                将导出的 JSON 文件导入到 PostgreSQL 数据库
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择 JSON 文件
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2.5"
                />
                {file && (
                  <p className="mt-2 text-sm text-green-600">
                    ✅ 已选择：{file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleImport}
              disabled={importing || !file}
              className="ml-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {importing ? '导入中...' : '📤 导入数据'}
            </button>
          </div>

          {/* 导入结果 */}
          {importResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              importResult.startsWith('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <pre className="whitespace-pre-wrap text-sm">{importResult}</pre>
            </div>
          )}
        </div>

        {/* 注意事项 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ 注意事项</h3>
          <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
            <li>导入前请确保已导出数据并下载了 JSON 文件</li>
            <li>导入会覆盖数据库中已有的同名数据（使用 upsert）</li>
            <li>建议在导入前备份数据库</li>
            <li>导入完成后，请刷新页面以确保数据已正确加载</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
