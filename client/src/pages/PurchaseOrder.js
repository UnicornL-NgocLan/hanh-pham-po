import { useState, useEffect, useRef } from 'react'
import {
    Button,
    Drawer,
    Form,
    Input,
    Space,
    Select,
    Statistic,
    DatePicker,
    Tag,
} from 'antd'
import axios from 'axios'
import { Table, Modal, InputNumber } from 'antd'
import { FaTrash } from 'react-icons/fa'
import { useZustand } from '../zustand.js'
import moment from 'moment'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { IoPrint } from 'react-icons/io5'
import { MdEdit } from 'react-icons/md'
import {
    exportPurchaseOrderToExcel,
    exportPurchaseRequestToExcel,
} from '../utils/createExcelFile.js'

const PurchaseOrder = () => {
    const [showDrawer, setShowDrawer] = useState(false)
    const { setPoState, pos } = useZustand()
    const [data, setData] = useState([])
    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')
    const searchInput = useRef(null)
    const [printing, setPrinting] = useState(false)

    const getPos = async (id = false) => {
        try {
            const { data } = await axios.get('/api/get-pos')
            setPoState(data.data)
            setData(data.data)

            if (showDrawer) {
                const myPO = data.data.find((i) => i._id === id)
                if (myPO) {
                    setShowDrawer(myPO)
                    return true
                }
            }
            return false
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
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

    const handlePrint = async (record) => {
        try {
            if (printing) return
            if (!record?._id) return alert('Không tồn tại chứng từ để in')
            setPrinting(true)
            const { data } = await axios.get(`/api/get-po-lines/${record?._id}`)
            await exportPurchaseOrderToExcel(record, data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        } finally {
            setPrinting(false)
        }
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
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Ngày đặt hàng',
            dataIndex: 'date_ordered',
            key: 'date_ordered',
            align: 'right',
            width: 130,
            sorter: (a, b) => moment(a.date_ordered) - moment(b.date_ordered),
            render: (value) => (
                <span>{moment(value).format('DD/MM/YYYY')}</span>
            ),
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'partner',
            key: 'partner',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('partner'),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'buyer',
            key: 'buyer',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('buyer'),
        },
        {
            title: 'Đề nghị mua hàng',
            dataIndex: 'pr',
            key: 'pr',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('pr'),
        },
        {
            title: 'Tiền không thuế',
            dataIndex: 'amount_untaxed',
            key: 'amount_untaxed',
            render: (text) => <span>{Intl.NumberFormat().format(text)}</span>,
        },
        {
            title: 'Thuế',
            dataIndex: 'tax',
            key: 'tax',
            render: (text) => <span>{Intl.NumberFormat().format(text)}</span>,
        },
        {
            title: 'Thành tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (text) => <span>{Intl.NumberFormat().format(text)}</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'Khả dụng' : 'Bị hủy'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        onClick={() => setShowDrawer(record)}
                        size="small"
                        disabled={printing}
                    >
                        <MdEdit />
                    </Button>
                    <Button
                        onClick={() => handlePrint(record)}
                        size="small"
                        disabled={printing}
                    >
                        <IoPrint />
                    </Button>
                </Space>
            ),
        },
    ]

    useEffect(() => {
        setData(pos)
    }, [])

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
                rowKey={(record) => record._id}
                dataSource={data.map((i) => {
                    return {
                        ...i,
                        partner: i?.partner_id?.name,
                        buyer: i?.buyer_id?.name,
                        pr: i?.pr_id?.name,
                    }
                })}
            />
            {showDrawer && (
                <MyDrawer
                    open={showDrawer}
                    onClose={() => setShowDrawer(false)}
                    getPos={getPos}
                />
            )}
        </div>
    )
}

export default PurchaseOrder

const MyDrawer = ({ open, onClose, getPos }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')
    const searchInput = useRef(null)
    const [showPurchaseOrderLineDrawer, setShowPurchaseOrderLineDrawer] =
        useState(false)
    const { partners, po_lines, setPoLineState, prs } = useZustand()

    const handleGetRespectiveLines = async () => {
        try {
            if (!open?._id) return
            setLoading(true)
            const { data } = await axios.get(`/api/get-po-lines/${open?._id}`)
            setPoLineState(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        } finally {
            setLoading(false)
        }
    }

    const handleOk = async () => {
        try {
            const {
                name,
                replaced_for_contract,
                pr_id,
                quotation_date,
                partner_id,
                buyer_id,
                date_deliveried,
                delivered_to,
                loading_cost,
                transfer_cost,
                date_ordered,
                payment_method_and_due_date,
                active,
            } = form.getFieldsValue()

            if (
                !name ||
                !replaced_for_contract ||
                !pr_id ||
                !quotation_date ||
                !partner_id ||
                !buyer_id ||
                !date_ordered
            )
                return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')

            if (open?._id && active === undefined)
                return alert('Vui lòng chọn trạng thái chứng từ')
            setLoading(true)

            let po_id_created
            if (open?._id) {
                await axios.patch(`/api/update-po/${open._id}`, {
                    name,
                    replaced_for_contract,
                    pr_id,
                    quotation_date,
                    partner_id,
                    buyer_id,
                    date_deliveried,
                    delivered_to,
                    loading_cost,
                    transfer_cost,
                    date_ordered,
                    payment_method_and_due_date,
                    active,
                })
            } else {
                const { data } = await axios.post('/api/create-po', {
                    name,
                    replaced_for_contract,
                    pr_id,
                    quotation_date,
                    partner_id,
                    buyer_id,
                    date_deliveried,
                    delivered_to,
                    loading_cost,
                    transfer_cost,
                    date_ordered,
                    payment_method_and_due_date,
                })
                po_id_created = data?.data?._id
            }
            const result = await getPos(open?._id || po_id_created)
            if (!result) {
                onClose()
            }
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleGetRespectiveLines()
    }, [])

    useEffect(() => {
        if (open?._id) {
            form.setFieldValue('name', open?.name)
            form.setFieldValue(
                'replaced_for_contract',
                open?.replaced_for_contract
            )
            form.setFieldValue('partner_id', open?.partner_id?._id)
            form.setFieldValue('buyer_id', open?.buyer_id?._id)
            form.setFieldValue('pr_id', open?.pr_id?._id)
            form.setFieldValue('date_ordered', dayjs(open?.date_ordered))
            form.setFieldValue('quotation_date', dayjs(open?.quotation_date))
            form.setFieldValue(
                'date_deliveried',
                open?.date_deliveried ? dayjs(open?.date_deliveried) : null
            )
            form.setFieldValue('delivered_to', open?.delivered_to)
            form.setFieldValue('loading_cost', open?.loading_cost)
            form.setFieldValue('transfer_cost', open?.transfer_cost)
            form.setFieldValue('active', open?.active)
            form.setFieldValue(
                'payment_method_and_due_date',
                open?.payment_method_and_due_date
            )
        }
    }, [open])

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
            title: 'Sản phẩm',
            dataIndex: 'product',
            key: 'product',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('product'),
        },
        {
            title: 'ĐVT',
            dataIndex: 'uom',
            key: 'uom',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Quy cách (cm)',
            dataIndex: 'quy_cach',
            key: 'quy_cach',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Chất lượng tiêu chuẩn',
            dataIndex: 'note',
            key: 'note',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price_unit',
            key: 'price_unit',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'Thành tiền',
            dataIndex: 'sub_total',
            key: 'sub_total',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },

        {
            title: 'Hành động',
            fixed: 'right',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="small"
                        onClick={() => setShowPurchaseOrderLineDrawer(record)}
                    >
                        <MdEdit />
                    </Button>
                    <Button
                        size="small"
                        danger
                        onClick={() => handleDeleteRecord(record)}
                    >
                        <FaTrash />
                    </Button>
                </Space>
            ),
        },
    ]

    const handleDeleteRecord = async (record) => {
        try {
            if (window.confirm('Bạn có chắc muốn xóa?')) {
                setLoading(true)
                await axios.delete(`/api/delete-po-line/${record._id}`)
                await handleGetRespectiveLines()
                await getPos(open?._id)
            }
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Drawer
            title={open?._id ? 'Chỉnh sửa' : 'Tạo mới'}
            closable={{ 'aria-label': 'Close Button' }}
            onClose={onClose}
            open={open}
            width={'100%'}
            extra={
                <Space>
                    <Button
                        onClick={onClose}
                        loading={loading}
                        disabled={loading}
                    >
                        Hủy
                    </Button>
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
                <Space.Compact style={{ display: 'flex' }}>
                    <Form.Item
                        style={{ flex: 1 }}
                        name="name"
                        label="Mã"
                        rules={[{ required: true, message: 'Nhập đầy đủ!' }]}
                    >
                        <Input className="w-full" readOnly disabled />
                    </Form.Item>
                    <Form.Item
                        style={{ flex: 1 }}
                        name="pr_id"
                        label="Đề nghị mua hàng"
                        rules={[
                            {
                                required: true,
                                message: 'Hãy chọn đề nghị mua hàng',
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            onChange={(e, record) => {
                                const poName = record.label.replace(
                                    'DN TS',
                                    'DH'
                                )
                                form.setFieldValue('name', poName)
                            }}
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={prs.map((i) => {
                                return { value: i._id, label: i.name }
                            })}
                        />
                    </Form.Item>
                </Space.Compact>
                <Form.Item
                    name="replaced_for_contract"
                    label="Thay thế cho phụ kiện của Hợp đồng nguyên tắc"
                    rules={[{ required: true, message: 'Nhập đầy đủ!' }]}
                >
                    <Input className="w-full" />
                </Form.Item>
                <Space.Compact style={{ display: 'flex' }}>
                    <Form.Item
                        name="quotation_date"
                        style={{ flex: 1 }}
                        label="Ngày báo giá"
                        rules={[{ required: true, message: 'Nhập đầy đủ!' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="date_ordered"
                        style={{ flex: 1 }}
                        label="Ngày đặt hàng"
                        rules={[{ required: true, message: 'Nhập đầy đủ!' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Space.Compact>
                <Space.Compact style={{ display: 'flex' }}>
                    <Form.Item
                        style={{ flex: 1 }}
                        name="partner_id"
                        label="Nhà cung cấp"
                        rules={[
                            {
                                required: true,
                                message: 'Hãy chọn nhà cung cấp',
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={partners.map((i) => {
                                return { value: i._id, label: i.name }
                            })}
                        />
                    </Form.Item>
                    <Form.Item
                        name="buyer_id"
                        style={{ flex: 1 }}
                        label="Khách hàng"
                        rules={[
                            {
                                required: true,
                                message: 'Hãy chọn khách hàng',
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={partners.map((i) => {
                                return { value: i._id, label: i.name }
                            })}
                        />
                    </Form.Item>
                </Space.Compact>
                <Space.Compact style={{ display: 'flex' }}>
                    <Form.Item
                        name="date_deliveried"
                        style={{ flex: 1 }}
                        label="Ngày giao hàng"
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="delivered_to"
                        label="Giao hàng đến"
                        style={{ flex: 1 }}
                    >
                        <Input className="w-full" />
                    </Form.Item>
                </Space.Compact>
                <Space.Compact style={{ display: 'flex' }}>
                    <Form.Item
                        name="loading_cost"
                        style={{ flex: 1 }}
                        label="Chi phí bốc xếp"
                    >
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item
                        name="transfer_cost"
                        label="Chi phí vận chuyển"
                        style={{ flex: 1 }}
                    >
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item
                        name="payment_method_and_due_date"
                        label="Hình thức và thời hạn thanh toán"
                        style={{ flex: 1 }}
                    >
                        <Input className="w-full" />
                    </Form.Item>
                </Space.Compact>
                {open?._id && (
                    <Form.Item
                        name="active"
                        style={{ flex: 1 }}
                        label="Trạng thái"
                        rules={[
                            {
                                required: true,
                                message: 'Hãy chọn đối tác',
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={[
                                {
                                    value: true,
                                    label: 'Khả dụng',
                                },
                                { value: false, label: 'Bị hủy' },
                            ]}
                        />
                    </Form.Item>
                )}

                <div style={{ marginBottom: 16 }}>
                    <Space size={100}>
                        <Statistic
                            title="Tiền không thuế"
                            value={
                                open?.amount_untaxed
                                    ? Intl.NumberFormat().format(
                                          open?.amount_untaxed
                                      )
                                    : 0
                            }
                        />
                        <Statistic
                            title="Thuế"
                            value={
                                open?.tax
                                    ? Intl.NumberFormat().format(open?.tax)
                                    : 0
                            }
                        />
                        <Statistic
                            title="Thành tiền"
                            value={
                                open?.total_amount
                                    ? Intl.NumberFormat().format(
                                          open?.total_amount
                                      )
                                    : 0
                            }
                        />
                    </Space>
                </div>

                {open?._id && (
                    <div>
                        <Button
                            type="primary"
                            style={{ marginBottom: 16 }}
                            onClick={() => setShowPurchaseOrderLineDrawer(true)}
                        >
                            Thêm mặt hàng
                        </Button>
                    </div>
                )}
            </Form>

            {showPurchaseOrderLineDrawer && (
                <MyPurchaseRequestLineDrawer
                    open={showPurchaseOrderLineDrawer}
                    handleGetRespectiveLines={handleGetRespectiveLines}
                    onClose={() => setShowPurchaseOrderLineDrawer(false)}
                    pr_id={open?._id}
                    getPos={getPos}
                />
            )}
            <Table
                columns={columns}
                size="small"
                rowKey={(record) => record._id}
                scroll={{ x: 'max-content' }}
                dataSource={po_lines.map((i) => {
                    return {
                        ...i,
                        product: `${
                            i?.product_id?.code
                                ? `[${i?.product_id?.code}] `
                                : ''
                        }${i?.product_id?.name}`,
                        uom: i?.uom_id?.name,
                        quy_cach:
                            !i.length && !i.height && !i.width
                                ? ''
                                : i.length && i.width && !i.height
                                ? `${i.length} x ${i.width}`
                                : `${i.length} x ${i.width} x ${i.height}`,
                    }
                })}
            />
        </Drawer>
    )
}

const MyPurchaseRequestLineDrawer = ({
    open,
    onClose,
    pr_id,
    handleGetRespectiveLines,
    getPos,
}) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const { products, uoms } = useZustand()

    const handleOk = async () => {
        try {
            const {
                product_id,
                uom_id,
                length,
                width,
                height,
                quantity,
                price_unit,
                sub_total,
                note,
            } = form.getFieldsValue()
            if (!product_id)
                return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')

            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-po-line/${open._id}`, {
                    product_id,
                    uom_id,
                    length,
                    width,
                    height,
                    quantity,
                    price_unit,
                    sub_total,
                    note,
                })
            } else {
                await axios.post('/api/create-po-line', {
                    order_id: pr_id,
                    product_id,
                    uom_id,
                    length,
                    width,
                    height,
                    quantity,
                    price_unit,
                    sub_total,
                    note,
                })
            }
            await getPos(pr_id)
            onClose()
            await handleGetRespectiveLines()
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        } finally {
            setLoading(false)
        }
    }

    const calculatePrice = () => {
        const quantity = form.getFieldValue('quantity')
        const price_unit = form.getFieldValue('price_unit')

        const sub_total = quantity * price_unit
        form.setFieldValue('sub_total', sub_total)
    }

    useEffect(() => {
        if (open?._id) {
            form.setFieldValue('product_id', open?.product_id?._id)
            form.setFieldValue('uom_id', open?.uom_id?._id)
            form.setFieldValue('width', open?.width)
            form.setFieldValue('length', open?.length)
            form.setFieldValue('height', open?.height)
            form.setFieldValue('quantity', open?.quantity)
            form.setFieldValue('price_unit', open?.price_unit)
            form.setFieldValue('sub_total', open?.sub_total)
            form.setFieldValue('note', open?.note)

            calculatePrice()
        } else {
            form.setFieldValue('width', 0)
            form.setFieldValue('length', 0)
            form.setFieldValue('height', 0)
            form.setFieldValue('quantity', 0)
            form.setFieldValue('price_unit', 0)
            form.setFieldValue('sub_total', 0)
        }
    }, [])

    return (
        <Modal
            title={open?._id ? 'Chỉnh sửa' : 'Tạo mới'}
            closable={{ 'aria-label': 'Close Button' }}
            onCancel={onClose}
            open={open}
            loading={loading}
            okText="Lưu"
            onOk={handleOk}
            cancelText="Hủy"
            width={1000}
        >
            <Form
                form={form}
                name="dynamic_ruleEdit"
                onFinish={handleOk}
                layout="vertical"
            >
                <Space.Compact style={{ display: 'flex' }}>
                    <Form.Item
                        style={{ flex: 5 }}
                        name="product_id"
                        label="Sản phẩm"
                        rules={[
                            {
                                required: true,
                                message: 'Hãy chọn sản phẩm',
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            onChange={(e) => {
                                const respectiveProduct = products.find(
                                    (item) => item._id === e
                                )
                                if (respectiveProduct) {
                                    form.setFieldValue(
                                        'uom_id',
                                        respectiveProduct.uom_id?._id
                                    )

                                    form.setFieldValue(
                                        'length',
                                        respectiveProduct.length || 0
                                    )

                                    form.setFieldValue(
                                        'width',
                                        respectiveProduct.width || 0
                                    )

                                    form.setFieldValue(
                                        'height',
                                        respectiveProduct.height || 0
                                    )
                                }
                            }}
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={products.map((i) => {
                                return {
                                    value: i._id,
                                    label: `${i.code ? `[${i.code}] ` : ''}${
                                        i.name
                                    }`,
                                }
                            })}
                        />
                    </Form.Item>
                    <Form.Item
                        name="uom_id"
                        label="Đơn vị tính"
                        style={{ flex: 2 }}
                    >
                        <Select
                            disabled
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={uoms.map((i) => {
                                return {
                                    value: i._id,
                                    label: i.name,
                                }
                            })}
                        />
                    </Form.Item>
                </Space.Compact>
                <Space>
                    <Form.Item name="length" label="Chiều dài">
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
                                    ? parseFloat(
                                          value.toString().replace(/,/g, '')
                                      ) // remove commas
                                    : 0
                            }
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item name="width" label="Chiều rộng">
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
                                    ? parseFloat(
                                          value.toString().replace(/,/g, '')
                                      ) // remove commas
                                    : 0
                            }
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item name="height" label="Chiều cao">
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
                                    ? parseFloat(
                                          value.toString().replace(/,/g, '')
                                      ) // remove commas
                                    : 0
                            }
                            min={0}
                        />
                    </Form.Item>
                </Space>
                <Form.Item name="note" label="Chất lượng tiêu chuẩn">
                    <Input className="w-full" />
                </Form.Item>
                <Space>
                    <Form.Item name="quantity" label="Số lượng" required>
                        <InputNumber
                            onChange={calculatePrice}
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
                                    ? parseFloat(
                                          value.toString().replace(/,/g, '')
                                      ) // remove commas
                                    : 0
                            }
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        name="price_unit"
                        required
                        label="Đơn giá (không gồm thuế)"
                    >
                        <InputNumber
                            inputMode="decimal"
                            onChange={calculatePrice}
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
                                    ? parseFloat(
                                          value.toString().replace(/,/g, '')
                                      ) // remove commas
                                    : 0
                            }
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item name="sub_total" label="Thành tiền">
                        <InputNumber
                            readOnly
                            disabled
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
                                    ? parseFloat(
                                          value.toString().replace(/,/g, '')
                                      ) // remove commas
                                    : 0
                            }
                            min={0}
                        />
                    </Form.Item>
                </Space>
            </Form>
        </Modal>
    )
}
