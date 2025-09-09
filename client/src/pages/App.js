import { useState } from 'react'
import { Layout, Menu, theme } from 'antd'
import { Outlet, useNavigate } from 'react-router'
import { TfiPackage } from 'react-icons/tfi'
import { FaRegUser } from 'react-icons/fa6'
import { IoIosWater } from 'react-icons/io'
import { VscGitPullRequestNewChanges } from 'react-icons/vsc'
import { TbHexagonNumber3Filled } from 'react-icons/tb'
import { IoDocumentTextSharp } from 'react-icons/io5'
const { Content, Sider } = Layout

const siderStyle = {
    overflow: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
}

const App = () => {
    const [sidebarIndex, setSidebarIndex] = useState('1')
    const navigate = useNavigate()

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()

    const handleNavigate = (name, value) => {
        setSidebarIndex(value.toString())
        navigate(name)
    }

    const navbarItems = [
        {
            key: 1,
            icon: <TfiPackage />,
            label: 'Sản phẩm',
            onClick: () => {
                handleNavigate('/', 1)
            },
        },
        {
            key: 2,
            icon: <FaRegUser />,
            label: 'Liên hệ',
            onClick: () => {
                handleNavigate('/partner', 2)
            },
        },
        {
            key: 3,
            icon: <IoIosWater />,
            label: 'Đơn vị đo lường',
            onClick: () => {
                handleNavigate('/uom', 3)
            },
        },
        {
            key: 4,
            icon: <VscGitPullRequestNewChanges />,
            label: 'Yêu cầu mua hàng',
            onClick: () => {
                handleNavigate('/purchase-request', 4)
            },
        },
        {
            key: 6,
            icon: <IoDocumentTextSharp />,
            label: 'Đơn mua hàng',
            onClick: () => {
                handleNavigate('/purchase-order', 6)
            },
        },
        {
            key: 5,
            icon: <TbHexagonNumber3Filled />,
            label: 'Số thứ tự',
            onClick: () => {
                handleNavigate('/purchase-request-sequence', 5)
            },
        },
    ]

    return (
        <Layout hasSider>
            <Sider style={siderStyle} width={220} collapsible trigger={null}>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[sidebarIndex]}
                    items={navbarItems}
                />
            </Sider>
            <Layout>
                <Content
                    style={{ margin: '24px 16px 24px', overflow: 'initial' }}
                >
                    <div
                        style={{
                            padding: 24,
                            boxShadow: '1px 1px 1px rgba(0,0,0,0.1)',
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}
export default App
