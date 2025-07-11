import React from 'react'
import { Layout, Menu, Button, Space, Divider } from 'antd'
import { CopyOutlined, MergeCellsOutlined, SettingOutlined, GithubOutlined, FileImageOutlined } from '@ant-design/icons'
import { Typography } from 'antd'

const { Sider } = Layout
const { Title } = Typography

interface SidebarProps {
    activeTab: string
    onTabChange: (key: string) => void
    onSettingsClick: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onSettingsClick }) => {
    const handleGithubClick = () => {
        window.open('https://github.com/your-repo/photo-copier', '_blank')
    }

    const menuItems = [
        {
            key: 'copy',
            icon: <CopyOutlined />,
            label: '照片拷贝',
        },
        {
            key: 'hdr',
            icon: <MergeCellsOutlined />,
            label: 'HDR合并',
        },
    ]

    return (
        <Sider width={200} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
            {/* Logo区域 */}
            <div
                style={{
                    padding: '16px',
                    textAlign: 'center',
                    borderBottom: '1px solid #f0f0f0',
                    background: '#fafafa',
                }}
            >
                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                    <FileImageOutlined /> 照片工具
                </Title>
            </div>

            {/* 功能菜单 */}
            <div style={{ padding: '8px 0' }}>
                <Menu mode="inline" selectedKeys={[activeTab]} items={menuItems} onClick={({ key }) => onTabChange(key)} style={{ borderRight: 0 }} />
            </div>

            {/* 底部操作区域 */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '16px',
                    background: '#fafafa',
                    borderTop: '1px solid #f0f0f0',
                }}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Button type="text" icon={<SettingOutlined />} onClick={onSettingsClick} style={{ width: '100%', textAlign: 'left' }}>
                        设置
                    </Button>

                    <Button type="text" icon={<GithubOutlined />} onClick={handleGithubClick} style={{ width: '100%', textAlign: 'left' }}>
                        GitHub
                    </Button>
                </Space>
            </div>
        </Sider>
    )
}

export default Sidebar
