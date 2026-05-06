import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useZustand } from '../zustand.js'
import { Button, Drawer, Form, Input, Space, Select, Table, Modal, DatePicker, Checkbox } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'
import moment from 'moment'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)

const { RangePicker } = DatePicker

const Contract = () => {
    const [showDrawer, setShowDrawer] = useState(false)
    const [showHistory, setShowHistory] = useState(null)
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
    const getDateRangeSearchProps = (dataIndex) => ({
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
                <Space direction="vertical" style={{ display: 'flex' }}>
                    <RangePicker
                        value={selectedKeys[0]?.range}
                        onChange={(dates) => {
                            setSelectedKeys([
                                {
                                    ...selectedKeys[0],
                                    range: dates,
                                    filterNull: false,
                                },
                            ])
                        }}
                        style={{
                            marginBottom: 8,
                        }}
                    />
                    <Checkbox
                        checked={selectedKeys[0]?.filterNull}
                        onChange={(e) => {
                            setSelectedKeys([
                                {
                                    ...selectedKeys[0],
                                    filterNull: e.target.checked,
                                    range: null,
                                },
                            ])
                        }}
                    >
                        Không có giá trị
                    </Checkbox>
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{
                                width: 90,
                            }}
                        >
                            Tìm kiếm
                        </Button>
                        <Button
                            onClick={() => {
                                clearFilters()
                                confirm()
                            }}
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
                                close()
                            }}
                        >
                            Đóng
                        </Button>
                    </Space>
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
        onFilter: (value, record) => {
            if (!value || (!value.range && !value.filterNull)) return true
            const { range, filterNull } = value
            const recordValue = record[dataIndex]

            if (filterNull) {
                return !recordValue
            }

            if (range && range.length === 2) {
                if (!recordValue) return false
                const date = dayjs(recordValue)
                return date.isBetween(range[0], range[1], 'day', '[]')
            }

            return true
        },
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
            title: 'Ngày có hàng gần nhất',
            dataIndex: 'latest_delivery_date',
            key: 'latest_delivery_date',
            ...getDateRangeSearchProps('latest_delivery_date'),
            render: (text) => (
                <span>
                    {text ? dayjs(text).format('DD/MM/YYYY') : ''}
                </span>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => setShowDrawer(record)}>
                        Chỉnh sửa
                    </Button>
                    <Button onClick={() => setShowHistory(record)}>
                        Lịch sử
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
            {showHistory && (
                <HistoryModal
                    open={showHistory}
                    onClose={() => setShowHistory(null)}
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

const HistoryModal = ({ open, onClose }) => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open?._id) {
            fetchHistory()
        }
    }, [open])

    const fetchHistory = async () => {
        try {
            setLoading(true)
            const res = await axios.get(
                `/api/get-po-lines-by-contract/${open._id}`
            )
            setData(res.data.data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            title: 'Số ĐH',
            dataIndex: 'po_name',
            key: 'po_name',
            width: 150,
            fixed: 'left',
        },
        {
            title: 'Ngày đặt hàng PO',
            dataIndex: 'po_date_ordered',
            key: 'po_date_ordered',
            width: 130,
            render: (value) =>
                value ? <span>{moment(value).format('DD/MM/YYYY')}</span> : '-',
        },
        {
            title: 'Ngày giao hàng PO',
            dataIndex: 'po_date_deliveried',
            key: 'po_date_deliveried',
            width: 130,
            render: (value) =>
                value ? <span>{moment(value).format('DD/MM/YYYY')}</span> : '-',
        },
        {
            title: 'Ngày nhập kho PO',
            dataIndex: 'po_date_received',
            key: 'po_date_received',
            width: 130,
            render: (value) =>
                value ? <span>{moment(value).format('DD/MM/YYYY')}</span> : '-',
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'product',
            key: 'product',
            width: 200,
        },
        {
            title: 'ĐVT',
            dataIndex: 'uom',
            key: 'uom',
            width: 80,
        },
        {
            title: 'Quy cách (cm)',
            dataIndex: 'quy_cach',
            key: 'quy_cach',
            width: 120,
        },
        {
            title: 'Chất lượng tiêu chuẩn',
            dataIndex: 'standard',
            width: 180,
            key: 'standard',
        },
        {
            title: 'Khách hàng',
            dataIndex: 'buyer',
            key: 'buyer',
            width: 150,
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
            width: 150,
        },
        {
            title: 'Mặt hàng',
            dataIndex: 'bundle',
            key: 'bundle',
            width: 150,
        },
        {
            title: 'Packing',
            dataIndex: 'packing',
            key: 'packing',
            width: 150,
        },
        {
            title: 'Hợp đồng',
            dataIndex: 'contract',
            key: 'contract',
            width: 150,
        },
        {
            title: 'Ngày báo giá',
            dataIndex: 'quotation_date',
            key: 'quotation_date',
            width: 120,
            align: 'right',
            render: (value) =>
                value ? (
                    <span>{moment(value).format('DD/MM/YYYY')}</span>
                ) : undefined,
        },
        {
            title: 'SL theo HĐ',
            dataIndex: 'contract_quantity',
            key: 'contract_quantity',
            width: 100,
            align: 'right',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'Kho tổng',
            dataIndex: 'kho_tong',
            key: 'kho_tong',
            width: 100,
            align: 'right',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'SL cần thêm',
            dataIndex: 'sl_can_them',
            key: 'sl_can_them',
            width: 100,
            align: 'right',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: '% hao hụt',
            dataIndex: 'loss_rate',
            key: 'loss_rate',
            width: 100,
            align: 'right',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'SL cần mua',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 110,
            align: 'right',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price_unit',
            key: 'price_unit',
            width: 110,
            align: 'right',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'Thành tiền',
            dataIndex: 'sub_total',
            key: 'sub_total',
            width: 120,
            align: 'right',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            width: 150,
        },
    ]

    return (
        <Modal
            title={`Lịch sử hợp đồng: ${open?.code || ''}`}
            open={!!open}
            onCancel={onClose}
            footer={null}
            width={1300}
            style={{ top: 20 }}
        >
            <Table
                columns={columns}
                dataSource={data.map((i) => {
                    let contractString = ''
                    const contractList = i.contract_id || []
                    for (let k = 0; k < contractList.length; k++) {
                        if (k === contractList.length - 1) {
                            contractString =
                                contractString + contractList[k]?.code
                        } else {
                            contractString =
                                contractString + contractList[k]?.code + ', '
                        }
                    }
                    return {
                        ...i,
                        po_name: i.order_id?.name,
                        po_date_ordered: i.order_id?.date_ordered,
                        po_date_deliveried: i.order_id?.date_deliveried,
                        po_date_received: i.order_id?.date_received,
                        product: i.product_id?.name,
                        uom: i.uom_id?.name,
                        buyer: i.buyer_id?.name,
                        brand: i.brand_id?.name,
                        bundle: i.bundle_id?.name,
                        contract: contractString,
                        packing: i.packing_id?.name,
                        sl_can_them:
                            (i.contract_quantity || 0) - (i.kho_tong || 0),
                    }
                })}
                rowKey="_id"
                loading={loading}
                size="small"
                pagination={{ pageSize: 15 }}
                scroll={{ x: 'max-content', y: 'calc(100vh - 250px)' }}
            />
        </Modal>
    )
}
