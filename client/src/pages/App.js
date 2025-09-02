import { useState, useEffect } from 'react'
import { Layout, Menu, theme, Button, Space } from 'antd'
import { Outlet, useNavigate } from 'react-router'
import { TfiPackage } from 'react-icons/tfi'
import { FaRegUser } from 'react-icons/fa6'
import { IoIosWater } from 'react-icons/io'
const { Header, Content, Sider } = Layout

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
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [sidebarIndex, setSidebarIndex] = useState('1')
    const [collapsed, setCollapsed] = useState(true)
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
    ]

    // const handleFetchData = async () => {
    //   try {
    //     setIsFetching(true)
    //     const result = await Promise.all([
    //       app.get(`/api/get-users`),
    //       app.get('/api/get-companies'),
    //       app.get('/api/get-banks'),
    //       app.get('/api/get-bank-accounts'),
    //       app.get('/api/get-indentures'),
    //       app.get('/api/get-payment-plans'),
    //       app.get('/api/get-sources'),
    //       app.get('/api/get-objects'),
    //       app.get('/api/get-rights'),
    //       app.get('/api/get-access-groups'),
    //       app.get('/api/get-loan-contracts'),
    //       app.get('/api/get-inter-company-finances'),
    //       app.get('/api/get-company-types'),
    //       app.get('/api/get-chartel-capital-transactions'),
    //       app.get('/api/get-accounts'),
    //       app.get('/api/get-money-flow-reasons'),
    //     ])

    //     setUserState(result[0]?.data?.data)
    //     setCompanyState(result[1]?.data?.data)
    //     setBankState(result[2]?.data?.data)
    //     setBankAccountState(result[3]?.data?.data)
    //     setIndentureState(result[4]?.data?.data)
    //     setPaymentPlanState(result[5]?.data?.data)
    //     setSourceState(result[6]?.data?.data)
    //     setObjectsState(result[7]?.data?.data)
    //     setRightsState(result[8]?.data?.data)
    //     setAccessGroupState(result[9]?.data?.data)
    //     setLoanContractState(result[10]?.data?.data)
    //     setInterCompanyFinanceState(result[11]?.data?.data)
    //     setCompanyTypeState(result[12]?.data?.data)
    //     setChartelCapitalTransactionsState(result[13]?.data?.data)
    //     setAccountState(result[14]?.data?.data)
    //     setMoneyFlowReasonState(result[15]?.data?.data)
    //   } catch (error) {
    //     alert(error?.response?.data?.msg || error)
    //   } finally {
    //     setIsFetching(false)
    //   }
    // }

    useEffect(() => {
        // handleFetchData()
    }, [])

    // if (isFetching) return <Loading />

    return (
        <Layout hasSider>
            <Sider
                style={siderStyle}
                width={220}
                collapsible
                trigger={null}
                collapsed={!collapsed}
            >
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
