import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useZustand } from '../zustand.js'
import { Button, Drawer, Form, Input, Space, Select, Table } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'

const Contract = () => {
    const [showDrawer, setShowDrawer] = useState(false)
    const [data, setData] = useState([])
    const { setContractState, contracts } = useZustand()
    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')
    const searchInput = useRef(null)

    const getContracts = async () => {
        try {
            const { data } = await axios.get('/api/get-contracts')
            setContractState(data.data)
            setData(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

    useEffect(() => {
        setData(contracts)
    }, [])

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm()
        setSearchText(selectedKeys[0])
        setSearchedColumn(dataIndex)
    }

    const handleReset = (clearFilters) => {
        clearFilters()
        setSearchText('')
    }

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            close,
        }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        handleSearch(selectedKeys, confirm, dataIndex)
                    }
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            handleSearch(selectedKeys, confirm, dataIndex)
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={() =>
                            clearFilters && handleReset(clearFilters)
                        }
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            })
                            setSearchText(selectedKeys[0])
                            setSearchedColumn(dataIndex)
                        }}
                    >
                        OK
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close()
                        }}
                    >
                        Đóng
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ?.toString()
                ?.toLowerCase()
                ?.includes(value?.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100)
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    })

    const columns = [
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('code'),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'partner',
            key: 'partner',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('partner'),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => setShowDrawer(record)}>
                        Chỉnh sửa
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div>
            <Button
                type="primary"
                onClick={() => setShowDrawer(true)}
                style={{ marginBottom: 16 }}
            >
                Tạo
            </Button>
            <Table
                columns={columns}
                size="small"
                dataSource={data.map((i) => {
                    return { ...i, partner: i?.partner_id?.name }
                })}
                rowKey={(record) => record._id}
            />
            {showDrawer && (
                <MyDrawer
                    open={showDrawer}
                    onClose={() => setShowDrawer(false)}
                    getContracts={getContracts}
                />
            )}
        </div>
    )
}

export default Contract

const MyDrawer = ({ open, onClose, getContracts }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const { partners } = useZustand()
    const handleOk = async () => {
        try {
            const { code, partner_id } = form.getFieldsValue()
            if (!code) return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-contract/${open._id}`, {
                    code,
                    partner_id,
                })
            } else {
                await axios.post('/api/create-contract', { code, partner_id })
            }
            onClose()
            await getContracts()
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open?._id) {
            form.setFieldValue('code', open?.code)
            form.setFieldValue('partner_id', open?.partner_id?._id)
        }
    }, [])

    return (
        <Drawer
            title={open?._id ? 'Chỉnh sửa' : 'Tạo mới'}
            closable={{ 'aria-label': 'Close Button' }}
            onClose={onClose}
            open={open}
            width={600}
            extra={
                <Space>
                    <Button
                        onClick={handleOk}
                        type="primary"
                        loading={loading}
                        disabled={loading}
                    >
                        Lưu
                    </Button>
                </Space>
            }
        >
            <Form
                form={form}
                name="dynamic_ruleEdit"
                onFinish={handleOk}
                layout="vertical"
            >
                <Form.Item
                    name="code"
                    label="Mã hợp đồng"
                    rules={[
                        { required: true, message: 'Hãy nhập mã hợp đồng!' },
                    ]}
                >
                    <Input
                        className="w-full"
                        onChange={(e) => {
                            if (
                                e.target.value.length > 4 &&
                                !form.getFieldValue('partner_id')
                            ) {
                                let code = e.target.value.slice(2, 5)
                                console.log(code)
                                const respectivePartner = partners?.find(
                                    (item) => item.code === code
                                )
                                if (respectivePartner) {
                                    form.setFieldValue(
                                        'partner_id',
                                        respectivePartner?._id
                                    )
                                }
                            }
                        }}
                    />
                </Form.Item>
                <Form.Item name="partner_id" label="Khách hàng">
                    <Select
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '')
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        options={partners.map((i) => {
                            return {
                                value: i._id,
                                label: i.name,
                            }
                        })}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}
