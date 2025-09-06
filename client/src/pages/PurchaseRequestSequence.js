import { useState, useEffect, useRef } from 'react'
import { Button, Drawer, Form, Input, Space, InputNumber } from 'antd'
import axios from 'axios'
import { Table } from 'antd'
import { useZustand } from '../zustand.js'
import moment from 'moment'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'

const PurchaseRequestSequence = () => {
    const [showDrawer, setShowDrawer] = useState(false)
    const { setPrSequenceState, pr_sequences } = useZustand()
    const [data, setData] = useState([])
    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')
    const searchInput = useRef(null)

    const getPrs = async () => {
        try {
            const { data } = await axios.get('/api/get-pr-sequences')
            setPrSequenceState(data.data)
            setData(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

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
            title: 'Số hiện tại',
            dataIndex: 'currentNumber',
            key: 'currentNumber',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('currentNumber'),
        },
        {
            title: 'Từ',
            dataIndex: 'from',
            key: 'from',
            align: 'right',
            sorter: (a, b) =>
                moment(a.from).subtract(7, 'hour') -
                moment(b.from).subtract(7, 'hour'),
            render: (value) => (
                <span>
                    {moment(value).subtract(7, 'hour').format('DD/MM/YYYY')}
                </span>
            ),
        },
        {
            title: 'Đến',
            dataIndex: 'to',
            key: 'to',
            align: 'right',
            sorter: (a, b) =>
                moment(a.to).subtract(7, 'hour') -
                moment(b.to).subtract(7, 'hour'),
            render: (value) => (
                <span>
                    {moment(value).subtract(7, 'hour').format('DD/MM/YYYY')}
                </span>
            ),
        },
        {
            title: 'Đối tác',
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

    useEffect(() => {
        setData(pr_sequences)
    }, [])

    return (
        <div>
            <Table
                columns={columns}
                size="small"
                rowKey={(record) => record._id}
                dataSource={data.map((i) => {
                    return {
                        ...i,
                        partner: i?.partner_id?.name,
                    }
                })}
            />
            {showDrawer && (
                <MyDrawer
                    open={showDrawer}
                    onClose={() => setShowDrawer(false)}
                    getPrs={getPrs}
                />
            )}
        </div>
    )
}

export default PurchaseRequestSequence

const MyDrawer = ({ open, onClose, getPrs }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const handleOk = async () => {
        try {
            const { currentNumber } = form.getFieldsValue()
            if (
                currentNumber === undefined ||
                currentNumber < 0 ||
                !Number.isInteger(currentNumber)
            )
                return alert('Số thứ tự phải có và là số nguyên dương')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-pr-sequence/${open?._id}`, {
                    currentNumber,
                })
            }
            onClose()
            await getPrs()
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        console.log(open)
        if (open?._id) {
            form.setFieldValue('currentNumber', open?.currentNumber)
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
                <Form.Item name="currentNumber" label="Số hiện tại">
                    <InputNumber
                        inputMode="decimal"
                        style={{ width: '100%' }}
                        formatter={(value) =>
                            value
                                ? value
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',') // thousands with comma
                                : ''
                        }
                        parser={(value) =>
                            value
                                ? parseFloat(value.toString().replace(/,/g, '')) // remove commas
                                : 0
                        }
                        min={0}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}
