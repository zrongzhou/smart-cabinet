'use client';

import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useSettings } from '@/lib/xiaozhouBackend-settings-common';
import SettingsPageFrame from '@/components/xiaozhouBackend/SettingsPageFrame';

export const dynamic = 'force-dynamic';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

export default function NotificationsSettingsPage() {
  const hook = useSettings();
  const { settings, setSettings, testingWebhook, testResult, handleTestWebhook } = hook;

  return (
    <SettingsPageFrame
      hook={hook}
      title="微信通知"
      description="配置企业微信与个人微信通知机器人"
      backHref="/xiaozhouBackend/settings"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">微信通知设置</h2>
      <div className="max-w-2xl space-y-6">
        {/* 企业微信群机器人 Webhook 开关 */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">启用微信通知</h3>
            <p className="text-sm text-gray-500 mt-1">当有新联系消息时，通过企业微信群机器人发送通知</p>
          </div>
          <Toggle
            checked={settings.wechatNotificationEnabled}
            onChange={() => setSettings((prev) => ({ ...prev, wechatNotificationEnabled: !prev.wechatNotificationEnabled }))}
          />
        </div>

        {/* 个人微信通知（Server酱） */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-2">个人微信通知（Server酱）</h3>
          <p className="text-sm text-gray-500 mb-4">通过 Server酱 推送通知到个人微信（需绑定微信关注号）</p>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">启用个人微信通知</span>
            <Toggle
              checked={settings.wechatPersonalEnabled}
              onChange={() => setSettings((prev) => ({ ...prev, wechatPersonalEnabled: !prev.wechatPersonalEnabled }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Server酱 SendKey</label>
            <input
              type="text"
              value={settings.wechatPersonalSendKey || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, wechatPersonalSendKey: e.target.value }))}
              className="admin-form-input w-full font-mono text-sm"
              placeholder="SCTxxxxxxxxxx（从 ftqq.com 获取）"
            />
            <p className="mt-1 text-xs text-gray-500">
              1. 访问 sct.ftqq.com 注册/登录<br />
              2. 创建一个 SendKey 并复制到这里<br />
              3. 用微信扫描绑定 Server酱公众号即可接收消息
            </p>
          </div>
        </div>

        {/* 企业微信应用消息 */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-2">企业微信应用消息</h3>
          <p className="text-sm text-gray-500 mb-4">通过企业微信"自建应用"向成员发送私信（需企业管理员权限创建应用）</p>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">启用应用消息</span>
            <Toggle
              checked={settings.wecomAppEnabled}
              onChange={() => setSettings((prev) => ({ ...prev, wecomAppEnabled: !prev.wecomAppEnabled }))}
            />
          </div>

          {settings.wecomAppEnabled && (
            <div className="space-y-3 bg-blue-50/50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">企业ID (Corp ID)</label>
                <input
                  type="text"
                  value={settings.wecomCorpId || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, wecomCorpId: e.target.value }))}
                  className="admin-form-input w-full font-mono text-sm"
                  placeholder="wwxxxxxxxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">应用ID (Agent ID)</label>
                <input
                  type="text"
                  value={settings.wecomAgentId || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, wecomAgentId: e.target.value }))}
                  className="admin-form-input w-full font-mono text-sm"
                  placeholder="1000002"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">应用Secret</label>
                <input
                  type="password"
                  value={settings.wecomSecret || ''}
                  autoComplete="off"
                  onChange={(e) => setSettings((prev) => ({ ...prev, wecomSecret: e.target.value }))}
                  className="admin-form-input w-full font-mono text-sm"
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">接收人 UserID</label>
                <input
                  type="text"
                  value={settings.wecomToUser || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, wecomToUser: e.target.value }))}
                  className="admin-form-input w-full font-mono text-sm"
                  placeholder="@all（或具体 userId，多个用|分隔）"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                1. 登录 <strong>企业微信管理后台</strong> → 应用管理 → 创建自建应用<br />
                2. 在应用详情页获取 Agent ID 和 Secret<br />
                3. 在"我的企业"→"企业信息"中获取 Corp ID<br />
                4. 确保应用的"可见范围"包含目标接收人<br />
                ⚠️ 只能发给本企业的企业微信成员，无法推送给外部人员
              </p>
            </div>
          )}
        </div>

        {/* Webhook URL */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">企业微信群机器人 Webhook</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
              <input
                type="text"
                value={settings.wechatWebhookUrl}
                onChange={(e) => setSettings((prev) => ({ ...prev, wechatWebhookUrl: e.target.value }))}
                className="admin-form-input w-full font-mono text-sm"
                placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
              />
              <p className="mt-1 text-xs text-gray-500">在企业微信群中添加机器人，获取 Webhook 地址</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={testingWebhook || !settings.wechatWebhookUrl}
                className="btn-secondary flex items-center gap-2"
              >
                {testingWebhook ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    测试中...
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    测试发送
                  </>
                )}
              </button>

              {testResult && (
                <div className={`flex items-center gap-2 text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">使用说明</h3>
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 space-y-2">
            <p>1. 在企业微信中创建一个群聊</p>
            <p>2. 点击群设置 → 群机器人 → 添加机器人</p>
            <p>3. 设置机器人名称和头像，复制 Webhook 地址</p>
            <p>4. 将 Webhook 地址粘贴到上方输入框</p>
            <p>5. 点击"测试发送"验证配置是否正确</p>
            <p>6. 保存设置后，有新联系消息时会自动发送通知到群</p>
          </div>
        </div>
      </div>
    </SettingsPageFrame>
  );
}
