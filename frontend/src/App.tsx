import React, { useState } from 'react'
import { Layout, Tooltip, Typography } from 'antd'
import { CopyOutlined, SettingOutlined, GithubOutlined, MergeCellsOutlined, InfoCircleOutlined } from '@ant-design/icons'
import './App.scss'
import { BrowserOpenURL } from '../wailsjs/runtime/runtime'

import PhotoCopy from './components/PhotoCopy'
import HdrMerge from './components/HdrMerge'
import Settings from './components/Settings'
import About from './components/About'

const { Sider, Content } = Layout

const siderWidth = 60

type ActiveTab = 'copy' | 'hdr'

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('copy')
    const [settingsVisible, setSettingsVisible] = useState<boolean>(false)
    const [aboutVisible, setAboutVisible] = useState<boolean>(false)

    const bottomMenuItems = [
        {
            key: 'settings',
            icon: <SettingOutlined className="menu-item-icon" />,
            label: '设置',
            onClick: () => setSettingsVisible(true),
        },
        {
            key: 'github',
            icon: <GithubOutlined className="menu-item-icon" />,
            label: 'GitHub',
            onClick: () => {
                BrowserOpenURL('https://github.com/yangchao-rabbit/photo-tools')
            },
        },
        {
            key: 'about',
            icon: <InfoCircleOutlined className="menu-item-icon" />,
            label: '关于',
            onClick: () => setAboutVisible(true),
        },
    ]

    const menuOptions = [
        {
            key: 'copy',
            icon: <CopyOutlined className="menu-item-icon" />,
            label: '拷贝照片',
            onClick: () => setActiveTab('copy'),
        },
        {
            key: 'hdr',
            icon: <MergeCellsOutlined className="menu-item-icon" />,
            label: 'HDR合并',
            onClick: () => setActiveTab('hdr'),
        },
    ]

    const renderContent = () => {
        switch (activeTab) {
            case 'copy':
                return <PhotoCopy />
            case 'hdr':
                return <HdrMerge />
            default:
                return <PhotoCopy />
        }
    }

    return (
        <Layout className="app-layout">
            <Sider width={siderWidth} className="app-sider">
                {/* 上部菜单 */}
                <div className="menu-container">
                    {menuOptions.map((item) => (
                        <Tooltip key={item.key} placement="right" title={item.label}>
                            <div className={`menu-item ${activeTab === item.key ? 'active' : ''}`} onClick={item.onClick}>
                                {item.icon}
                            </div>
                        </Tooltip>
                    ))}
                </div>

                {/* 下部菜单 */}
                <div className="bottom-menu-container">
                    {bottomMenuItems.map((item) => (
                        <Tooltip key={item.key} placement="right" title={item.label}>
                            <div className="menu-item" onClick={item.onClick}>
                                {item.icon}
                            </div>
                        </Tooltip>
                    ))}
                </div>
            </Sider>

            <Content className="app-content">{renderContent()}</Content>

            <Settings visible={settingsVisible} onClose={() => setSettingsVisible(false)} />

            <About visible={aboutVisible} onClose={() => setAboutVisible(false)} />
        </Layout>
    )
}

export default App
