import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useZustand } from '../zustand.js'
import { Button, Drawer, Form, Input, Space, Table, InputNumber } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'

const Bundle = () => {
    const [showDrawer, setShowDrawer] = useState(false)
    const [data, setData] = useState([])
    const { setBundleState, bundles } = useZustand()
    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')
    const searchInput = useRef(null)

    const getBundles = async () => {
        try {
            const { data } = await axios.get('/api/get-bundles')
            setBundleState(data.data)
            setData(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

    useEffect(() => {
        setData(bundles)
    }, [bundles])

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
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        handleSearch(selectedKeys, confirm, dataIndex)
                    }
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            handleSearch(selectedKeys, confirm, dataIndex)
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={() =>
                            clearFilters && handleReset(clearFilters)
                        }
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false })
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
                style={{ color: filtered ? '#1677ff' : undefined }}
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
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
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
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Số carton trong 1 container',
            dataIndex: 'number_of_carton_per_container',
            key: 'number_of_carton_per_container',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('number_of_carton_per_container'),
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
                dataSource={data}
                rowKey={(record) => record._id}
            />
            {showDrawer && (
                <MyDrawer
                    open={showDrawer}
                    onClose={() => setShowDrawer(false)}
                    getBundles={getBundles}
                />
            )}
        </div>
    )
}

export default Bundle

const MyDrawer = ({ open, onClose, getBundles }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleOk = async () => {
        try {
            const { name, number_of_carton_per_container } =
                form.getFieldsValue()
            if (!name) return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-bundle/${open._id}`, {
                    name,
                    number_of_carton_per_container,
                })
            } else {
                await axios.post('/api/create-bundle', {
                    name,
                    number_of_carton_per_container,
                })
            }
            onClose()
            await getBundles()
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open?._id) {
            form.setFieldsValue({
                name: open?.name,
                number_of_carton_per_container:
                    open?.number_of_carton_per_container,
            })
        } else {
            form.resetFields()
        }
    }, [open])

    return (
        <Drawer
            title={open?._id ? 'Chỉnh sửa' : 'Tạo mới'}
            onClose={onClose}
            open={!!open}
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
                name="bundleForm"
                onFinish={handleOk}
                layout="vertical"
            >
                <Form.Item
                    name="name"
                    label="Tên"
                    rules={[{ required: true, message: 'Hãy nhập tên!' }]}
                >
                    <Input className="w-full" />
                </Form.Item>
                <Form.Item
                    name="number_of_carton_per_container"
                    label="Số lượng carton trong 1 container"
                    initialValue={0}
                >
                    <InputNumber
                        inputMode="decimal"
                        style={{ width: '100%' }}
                        formatter={(value) =>
                            value
                                ? value
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                : ''
                        }
                        parser={(value) =>
                            value
                                ? parseFloat(value.toString().replace(/,/g, ''))
                                : 0
                        }
                        min={0}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}
