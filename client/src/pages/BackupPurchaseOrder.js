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
    Tooltip,
    Modal,
    Upload,
    Row,
    Col,
    Tabs,
} from 'antd'
import axios from 'axios'
import { Table, InputNumber } from 'antd'
import { FaTrash } from 'react-icons/fa'
import { useZustand } from '../zustand.js'
import moment from 'moment'
import Highlighter from 'react-highlight-words'
import { MdModeEdit } from 'react-icons/md'
import { DeleteFilled, EditFilled, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isBetween from 'dayjs/plugin/isBetween'
import { IoPrint } from 'react-icons/io5'
import { MdEdit } from 'react-icons/md'
import { IoDuplicate } from 'react-icons/io5'
import {
    exportPurchaseOrderToExcel,
    exportPurchaseRequestToExcel,
} from '../utils/createExcelFile.js'
import { exportSummaryExcelFile } from '../utils/exportSummaryExcelFile.js'
import { FaCirclePlus } from 'react-icons/fa6'
const { RangePicker } = DatePicker
dayjs.extend(customParseFormat)
dayjs.extend(isBetween)

const validExcelFile = [
    '.csv',
    '.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
]

const BackupPurchaseOrder = () => {
    const [showDrawer, setShowDrawer] = useState(false)
    const { setBackupPoState, backup_pos } = useZustand()
    const [data, setData] = useState([])
    const [searchText, setSearchText] = useState('')
    const [loading, setLoading] = useState(false)
    const [searchedColumn, setSearchedColumn] = useState('')
    const searchInput = useRef(null)
    const [printing, setPrinting] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [isFilteredDate, setIsFilteredDate] = useState(false)
    const fileInputReceiptRef = useRef(null)
    const {
        products,
        brands,
        partners,
        bundles,
        contracts,
        setContractState,
        packings,
    } = useZustand()
    const [trackerFilters, setTrackerFilters] = useState({
        buyer_id: 'all',
        bundle_id: 'all',
        brand_id: 'all',
        packing_id: 'all',
        status: 'all',
    })
    const [trackerData, setTrackerData] = useState([])
    const [trackerLoading, setTrackerLoading] = useState(false)
    const [appliedFilters, setAppliedFilters] = useState({
        status: 'all',
    })
    const [selectedDistinctRecord, setSelectedDistinctRecord] = useState(null)
    const [trackingDetailModalVisible, setTrackingDetailModalVisible] =
        useState(false)

    // UsedQuantityTransaction
    const [uqtModalVisible, setUqtModalVisible] = useState(false)
    const [uqtTargetLine, setUqtTargetLine] = useState(null)
    const [uqtForm, setUqtForm] = useState({
        usedQuantity: null,
        usedDate: null,
        usedForContractId: null,
    })
    const [uqtSubmitting, setUqtSubmitting] = useState(false)
    const [uqtTransactions, setUqtTransactions] = useState({}) // { [lineId]: [...] }
    // Edit UQT
    const [uqtEditModalVisible, setUqtEditModalVisible] = useState(false)
    const [uqtEditTarget, setUqtEditTarget] = useState(null) // the txn being edited
    const [uqtEditForm, setUqtEditForm] = useState({
        usedQuantity: null,
        usedDate: null,
        usedForContractId: null,
    })
    const [uqtEditSubmitting, setUqtEditSubmitting] = useState(false)
    const [openMyContractDrawer, setOpenMyContractDrawer] = useState(false)

    const getContracts = async () => {
        try {
            const { data } = await axios.get('/api/get-contracts')
            setContractState(data.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (contracts.length === 0) {
            getContracts()
        }
    }, [])

    const fetchTrackerData = async () => {
        try {
            setTrackerLoading(true)
            const { buyer_id, bundle_id, brand_id, packing_id } = trackerFilters
            const { data } = await axios.get(
                `/api/get-po-tracker?buyer_id=${buyer_id}&bundle_id=${bundle_id}&brand_id=${brand_id}&packing_id=${packing_id}`
            )
            setTrackerData(data.data)
            setAppliedFilters({ status: trackerFilters.status })

            // Bulk-fetch UQT transactions for all returned lines
            if (data.data && data.data.length > 0) {
                const lineIds = data.data.map((l) => l._id).join(',')
                const uqtRes = await axios.get(
                    `/api/get-used-qty-transactions-bulk?line_ids=${lineIds}`
                )
                const grouped = {}
                uqtRes.data.data.forEach((t) => {
                    const lid =
                        t.purchase_order_line_id?._id ||
                        t.purchase_order_line_id
                    if (!grouped[lid]) grouped[lid] = []
                    grouped[lid].push(t)
                })
                setUqtTransactions((prev) => ({ ...prev, ...grouped }))
            }
        } catch (error) {
            console.error(error)
            alert('Lỗi khi tải dữ liệu theo dõi')
        } finally {
            setTrackerLoading(false)
        }
    }

    const fetchUqtByLine = async (lineId) => {
        try {
            const { data } = await axios.get(
                `/api/get-used-qty-transactions/${lineId}`
            )
            setUqtTransactions((prev) => ({ ...prev, [lineId]: data.data }))
        } catch (error) {
            console.error(error)
        }
    }

    const handleCreateUqt = async () => {
        if (!uqtTargetLine) return
        if (!uqtForm.usedQuantity || uqtForm.usedQuantity <= 0) {
            return alert('Vui lòng nhập số lượng sử dụng hợp lệ')
        }

        // Client-side: kiểm tra tổng không vượt quá quantity của line
        const lineQty = uqtTargetLine.quantity || 0
        const existingTxns = uqtTransactions[uqtTargetLine._id] || []
        const totalUsed = existingTxns.reduce(
            (sum, t) => sum + (t.usedQuantity || 0),
            0
        )
        const remaining = lineQty - totalUsed
        if (uqtForm.usedQuantity > remaining) {
            return alert(
                `Số lượng vượt quá giới hạn!\nĐã sử dụng: ${Intl.NumberFormat().format(totalUsed)}\nSố lượng đơn: ${Intl.NumberFormat().format(lineQty)}\nCòn lại: ${Intl.NumberFormat().format(remaining)}`
            )
        }

        try {
            setUqtSubmitting(true)
            await axios.post('/api/create-used-qty-transaction', {
                purchase_order_line_id: uqtTargetLine._id,
                usedQuantity: uqtForm.usedQuantity,
                usedDate: uqtForm.usedDate ? uqtForm.usedDate.toDate() : null,
                usedForContractId: uqtForm.usedForContractId || null,
            })
            await fetchUqtByLine(uqtTargetLine._id)
            setUqtModalVisible(false)
            setUqtForm({
                usedQuantity: null,
                usedDate: null,
                usedForContractId: null,
            })
            setUqtTargetLine(null)
        } catch (error) {
            console.error(error)
            alert(error?.response?.data?.msg || 'Lỗi khi tạo giao dịch')
        } finally {
            setUqtSubmitting(false)
        }
    }

    const handleDeleteUqt = async (id, lineId) => {
        if (!window.confirm('Bạn có chắc muốn xóa?')) return
        try {
            await axios.delete(`/api/delete-used-qty-transaction/${id}`)
            setUqtTransactions((prev) => ({
                ...prev,
                [lineId]: (prev[lineId] || []).filter((t) => t._id !== id),
            }))
        } catch (error) {
            console.error(error)
            alert('Lỗi khi xóa giao dịch')
        }
    }

    const handleUpdateUqt = async () => {
        if (!uqtEditTarget) return
        if (!uqtEditForm.usedQuantity || uqtEditForm.usedQuantity <= 0) {
            return alert('Vui lòng nhập số lượng sử dụng hợp lệ')
        }

        // Client-side validation: tổng (các record khác) + giá trị mới <= line.quantity
        const lineId =
            uqtEditTarget.purchase_order_line_id?._id ||
            uqtEditTarget.purchase_order_line_id
        const existingTxns = (uqtTransactions[lineId] || []).filter(
            (t) => t._id !== uqtEditTarget._id
        )
        // Lấy quantity của line từ trackerData
        const lineRecord = trackerData.find((l) => l._id === lineId)
        const lineQty = lineRecord?.quantity || 0
        const otherTotal = existingTxns.reduce(
            (s, t) => s + (t.usedQuantity || 0),
            0
        )
        if (otherTotal + uqtEditForm.usedQuantity > lineQty) {
            return alert(
                `Số lượng vượt quá giới hạn!\nCác record khác đã dùng: ${Intl.NumberFormat().format(otherTotal)}\nSố lượng đơn: ${Intl.NumberFormat().format(lineQty)}\nTối đa có thể nhập: ${Intl.NumberFormat().format(lineQty - otherTotal)}`
            )
        }

        try {
            setUqtEditSubmitting(true)
            await axios.patch(
                `/api/update-used-qty-transaction/${uqtEditTarget._id}`,
                {
                    usedQuantity: uqtEditForm.usedQuantity,
                    usedDate: uqtEditForm.usedDate
                        ? uqtEditForm.usedDate.toDate()
                        : null,
                    usedForContractId: uqtEditForm.usedForContractId || null,
                }
            )
            await fetchUqtByLine(lineId)
            setUqtEditModalVisible(false)
            setUqtEditTarget(null)
        } catch (error) {
            console.error(error)
            alert(error?.response?.data?.msg || 'Lỗi khi cập nhật giao dịch')
        } finally {
            setUqtEditSubmitting(false)
        }
    }

    const getPos = async (id = false) => {
        try {
            const { data } = await axios.get('/api/get-pos?is_backup=true')
            setBackupPoState(data.data)
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

    const handleDelete = async (record) => {
        try {
            if (window.confirm('Bạn có thực sự muốn xóa ?')) {
                await axios.delete(`/api/delete-po/${record._id}`)
                await getPos()
                alert('Đã xóa thành công!')
            }
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        }
    }

    const handlePrint = async (record, isPrintPO) => {
        try {
            if (printing) return
            if (!record?._id) return alert('Không tồn tại chứng từ để in')
            setPrinting(true)
            const { data } = await axios.get(`/api/get-po-lines/${record?._id}`)
            if (isPrintPO) {
                await exportPurchaseOrderToExcel(record, data.data)
            } else {
                await exportPurchaseRequestToExcel(record, data.data)
            }
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        } finally {
            setPrinting(false)
        }
    }

    const handleExportSummaryFile = async () => {
        try {
            if (loading) return
            setLoading(true)
            const list = selectedRowKeys.map((i) =>
                axios.get(`/api/get-po-lines/${i}`)
            )

            const result = await Promise.all(list)
            const finalList = []
            for (let i = 0; i < result.length; i++) {
                const innerData = result[i].data.data.map((item) => {
                    return { ...item, po: result[i].data.po }
                })
                finalList.push(...innerData)
            }

            let processedData = []
            for (let i = 0; i < finalList.length; i++) {
                const month =
                    moment(finalList[i]?.po?.date).add(7, 'hours').month() + 1
                const stt = finalList[i]?.po?.pr_name?.split('/')[0]?.trim()
                const ncc = finalList[i]?.po?.partner_id?.code.trim()
                const ncc_short_name =
                    finalList[i]?.po?.partner_id?.short_name.trim()
                const so_don_hang = finalList[i]?.po?.name
                const product_name = finalList[i]?.product_id?.name
                const don_gia = finalList[i]?.price_unit
                const ngay_don_hang = moment(finalList[i]?.po?.date_ordered)
                    .add(7, 'hours')
                    .format('DD/MM/YYYY')
                const ngay_nhan_hang = finalList[i]?.po?.date_deliveried
                    ? moment(finalList[i]?.po?.date_deliveried)
                          .add(7, 'hours')
                          .format('DD/MM/YYYY')
                    : 'thông báo sau'
                const ordered_qty = finalList[i]?.quantity

                let contractString = ''
                const contractList = finalList[i]?.contract_id
                for (let k = 0; k < contractList.length; k++) {
                    if (k === contractList.length - 1) {
                        contractString = contractString + contractList[k]?.code
                    } else {
                        contractString =
                            contractString + contractList[k]?.code + ', '
                    }
                }
                const khach_hang = finalList[i]?.buyer_id?.name
                const quy_cach = finalList[i]?.quy_cach
                const tieu_chuan = finalList[i]?.standard
                const so_de_nghi = finalList[i]?.po?.pr_name || ''
                const can_cu = `Căn cứ vào bảng đề nghị mua vật tư: Số đề nghị ${so_de_nghi} của Phòng Kinh Doanh`
                processedData.push({
                    Tháng: month,
                    STT: stt,
                    NCC: ncc,
                    'Số Đơn Hàng': so_don_hang,
                    'Nhà cung cấp': ncc_short_name,
                    'Tên Hàng': product_name,
                    'Quy cách': quy_cach,
                    'Tiêu chuẩn': tieu_chuan,
                    'Ngày đơn hàng': ngay_don_hang,
                    'Ngày nhận hàng': ngay_nhan_hang,
                    'Số lượng đặt': ordered_qty,
                    'Số lượng nhận': 0,
                    'Số lượng chưa nhận': 0,
                    'NHẬN HÀNG thực tế': 0,
                    'Hợp đồng': contractString,
                    'Khách hàng': khach_hang,
                    'Số đề nghị': so_de_nghi,
                    'Căn cứ': can_cu,
                    'Đơn giá': don_gia,
                })
            }
            await exportSummaryExcelFile(processedData)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        } finally {
            setLoading(false)
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

    const handleImportReceiptDate = async (e) => {
        try {
            const file = e.target.files
            const fileType = file[0].type
            if (!validExcelFile.includes(fileType))
                return alert('File của bạn phải là excel')

            const buffer = await new Promise((resolve, reject) => {
                const fileReader = new FileReader()
                fileReader.readAsArrayBuffer(file[0])
                fileReader.onload = (e) => resolve(e.target.result)
                fileReader.onerror = (err) => reject(err)
            })

            const worker = new Worker(
                new URL('../workers/excelWorker.worker.js', import.meta.url)
            )

            worker.postMessage(buffer)

            worker.onmessage = async (e) => {
                const { success, data, error } = e.data
                if (success) {
                    const conflicts = []
                    const poMap = {}
                    data.forEach((row) => {
                        const orderName = row['ĐƠN HÀNG']
                            ?.toString()
                            ?.replace(/\s+/g, '')
                        let rawDate = row['NGÀY']
                        console.log(rawDate, orderName)

                        if (!orderName || !rawDate) return

                        let dateStr = rawDate
                        if (typeof rawDate === 'number') {
                            const date = new Date(
                                Math.round((rawDate - 25569) * 86400 * 1000)
                            )
                            dateStr = moment(date).format('DD/MM/YYYY')
                        }

                        if (!poMap[orderName]) {
                            poMap[orderName] = new Set()
                        }
                        poMap[orderName].add(dateStr)
                    })

                    Object.keys(poMap).forEach((name) => {
                        if (poMap[name].size > 1) {
                            conflicts.push(
                                `${name} (${Array.from(poMap[name]).join(', ')})`
                            )
                        }
                    })

                    if (conflicts.length > 0) {
                        alert(
                            `Phát hiện xung đột dữ liệu (Cùng đơn hàng nhưng khác ngày):\n${conflicts.join('\n')}`
                        )
                        fileInputReceiptRef.current.value = ''
                        worker.terminate()
                        return
                    }

                    const updateData = []
                    Object.keys(poMap).forEach((name) => {
                        const dateStr = Array.from(poMap[name])[0]
                        const dateObj = moment(dateStr, 'DD/MM/YYYY').toDate()
                        updateData.push({
                            order_name: name,
                            date_received: dateObj,
                        })
                    })

                    if (updateData.length === 0) {
                        alert('Không tìm thấy dữ liệu hợp lệ trong file.')
                        fileInputReceiptRef.current.value = ''
                        worker.terminate()
                        return
                    }

                    await axios.post('/api/bulk-update-po-receipt-date', {
                        data: updateData,
                    })
                    alert('Đã cập nhật xong!')
                    await getPos()
                } else {
                    alert('Lỗi xử lý file: ' + error)
                }
                worker.terminate()
            }

            worker.onerror = (err) => {
                console.error('Worker error:', err)
                alert('Đã xảy ra lỗi trong quá trình xử lý file.')
                worker.terminate()
            }
        } catch (error) {
            alert('Lỗi: ' + (error?.response?.data?.msg || error.message))
        } finally {
            fileInputReceiptRef.current.value = ''
        }
    }

    const handleDateFilter = (dates, type, filterNull = false) => {
        if (filterNull) {
            const filtered = data.filter((item) => {
                const value =
                    type === 'received'
                        ? item.date_received
                        : type === 'delivered'
                          ? item.date_deliveried
                          : item.date_ordered
                return !value
            })
            setFilteredData(filtered)
            setIsFilteredDate(true)
            return
        }

        if (!dates || dates.length === 0) {
            setFilteredData(data)
            setIsFilteredDate(false)
        } else {
            const [start, end] = dates
            const filtered = data.filter((item) => {
                const startDay = dayjs(start, 'DD/MM/YYYY')
                const endDay = dayjs(end, 'DD/MM/YYYY')
                const rawValue =
                    type === 'received'
                        ? item.date_received
                        : type === 'delivered'
                          ? item.date_deliveried
                          : item.date_ordered

                if (!rawValue) return false

                const dueDateFormat = dayjs(rawValue)
                if (!dueDateFormat.isValid()) return false

                return dueDateFormat.isBetween(startDay, endDay, 'day', '[]')
            })
            setFilteredData(filtered)
            setIsFilteredDate(true)
        }
    }

    const getFilteredData = () => (isFilteredDate ? filteredData : data)

    const columns = [
        {
            title: 'Mã ĐN',
            dataIndex: 'pr_name',
            key: 'pr_name',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('pr_name'),
        },
        {
            title: 'Mã ĐH',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Người mua',
            dataIndex: 'buyer',
            key: 'buyer',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('buyer'),
        },
        {
            title: 'Hợp đồng',
            dataIndex: 'contract',
            key: 'contract',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('contract'),
        },
        {
            title: 'Ngày đặt hàng',
            dataIndex: 'date_ordered',
            key: 'date_ordered',
            align: 'right',
            sorter: (a, b) => {
                return (
                    dayjs(a.date_ordered).valueOf() -
                    dayjs(b.date_ordered).valueOf()
                )
            },
            filterDropdown: () => (
                <div style={{ padding: 8 }}>
                    <RangePicker
                        onChange={(dates) => handleDateFilter(dates, 'ordered')}
                    />
                </div>
            ),
            onFilter: () => {},
            render: (value) => (
                <span>{value ? dayjs(value).format('DD/MM/YYYY') : '-'}</span>
            ),
        },
        {
            title: 'Ngày giao hàng',
            dataIndex: 'date_deliveried',
            key: 'date_deliveried',
            align: 'right',
            sorter: (a, b) => {
                return (
                    dayjs(a.date_deliveried).valueOf() -
                    dayjs(b.date_deliveried).valueOf()
                )
            },
            filterDropdown: () => (
                <div style={{ padding: 8 }}>
                    <Space direction="vertical">
                        <RangePicker
                            onChange={(dates) =>
                                handleDateFilter(dates, 'delivered')
                            }
                        />
                        <Space>
                            <Button
                                type="link"
                                size="small"
                                onClick={() =>
                                    handleDateFilter(null, 'delivered', true)
                                }
                                style={{ padding: 0 }}
                            >
                                Đơn chưa có ngày
                            </Button>
                            <Button
                                type="link"
                                size="small"
                                onClick={() =>
                                    handleDateFilter(null, 'delivered')
                                }
                                style={{ padding: 0 }}
                                danger
                            >
                                Reset
                            </Button>
                        </Space>
                    </Space>
                </div>
            ),
            onFilter: () => {},
            render: (value) => (
                <span>{value ? moment(value).format('DD/MM/YYYY') : '-'}</span>
            ),
        },
        {
            title: 'Ngày nhập kho',
            dataIndex: 'date_received',
            key: 'date_received',
            align: 'right',
            sorter: (a, b) => {
                return (
                    dayjs(a.date_received).valueOf() -
                    dayjs(b.date_received).valueOf()
                )
            },
            filterDropdown: () => (
                <div style={{ padding: 8 }}>
                    <Space direction="vertical">
                        <RangePicker
                            onChange={(dates) =>
                                handleDateFilter(dates, 'received')
                            }
                        />
                        <Space>
                            <Button
                                type="link"
                                size="small"
                                onClick={() =>
                                    handleDateFilter(null, 'received', true)
                                }
                                style={{ padding: 0 }}
                            >
                                Đơn chưa có ngày
                            </Button>
                            <Button
                                type="link"
                                size="small"
                                onClick={() =>
                                    handleDateFilter(null, 'received')
                                }
                                style={{ padding: 0 }}
                                danger
                            >
                                Reset
                            </Button>
                        </Space>
                    </Space>
                </div>
            ),
            onFilter: () => {},
            render: (value) => (
                <span>{value ? moment(value).format('DD/MM/YYYY') : '-'}</span>
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
            title: 'Hành động',
            key: 'action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        onClick={() => setShowDrawer(record)}
                        size="small"
                        disabled={printing}
                    >
                        <MdEdit />
                    </Button>
                    <Tooltip title="In đề nghị mua hàng dự phòng">
                        <Button
                            onClick={() => handlePrint(record, false)}
                            size="small"
                            disabled={printing}
                        >
                            <IoPrint />
                        </Button>
                    </Tooltip>
                    <Tooltip title="In đơn mua hàng dự phòng">
                        <Button
                            type="primary"
                            onClick={() => handlePrint(record, true)}
                            size="small"
                            disabled={printing}
                        >
                            <IoPrint />
                        </Button>
                    </Tooltip>
                    <Button
                        danger
                        onClick={() => handleDelete(record)}
                        size="small"
                        disabled={printing}
                    >
                        <DeleteFilled />
                    </Button>
                </Space>
            ),
        },
    ]

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    }

    useEffect(() => {
        setData(backup_pos)
    }, [backup_pos])

    const distinctColumns = [
        {
            title: 'Khách hàng',
            dataIndex: 'buyer',
            key: 'buyer',
            render: (val) => val?.name || '-',
        },
        {
            title: 'Mặt hàng',
            dataIndex: 'bundle',
            key: 'bundle',
            render: (val) => val?.name || '-',
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
            render: (val) => val?.name || '-',
        },
        {
            title: 'Packing',
            dataIndex: 'packing',
            key: 'packing',
            render: (val) => val?.name || '-',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            align: 'center',
            render: (_, record) => {
                const isFull = record.status === 'unavailable'
                return (
                    <Tag color={isFull ? 'warning' : 'success'}>
                        {isFull ? 'Không có sẵn' : 'Tồn kho'}
                    </Tag>
                )
            },
        },
    ]

    const getFilteredDistinctRecords = () => {
        const distinctMap = {}
        trackerData.forEach((item) => {
            const bundleId = item.bundle_id?._id || 'null'
            const packingId = item.packing_id?._id || 'null'
            const brandId = item.brand_id?._id || 'null'
            const buyerId =
                item.buyer_id?._id || item.order_id?.buyer_id || 'null'
            const key = `${bundleId}_${packingId}_${brandId}_${buyerId}`

            if (!distinctMap[key]) {
                distinctMap[key] = {
                    key,
                    bundle: item.bundle_id,
                    packing: item.packing_id,
                    brand: item.brand_id,
                    buyer: item.buyer_id || { _id: buyerId, name: '-' },
                    products: {},
                }
            }
            const productId = item.product_id?._id || 'unknown'
            if (!distinctMap[key].products[productId]) {
                distinctMap[key].products[productId] = {
                    total_quantity: 0,
                    lines: [],
                }
            }
            distinctMap[key].products[productId].total_quantity +=
                item.quantity || 0
            distinctMap[key].products[productId].lines.push(item)
        })

        let result = Object.values(distinctMap).map((record) => {
            let hasAvailable = false
            Object.values(record.products).forEach((prodGroup) => {
                const total_used = prodGroup.lines.reduce((sum, line) => {
                    const txns = uqtTransactions[line._id] || []
                    return (
                        sum +
                        txns.reduce((s, t) => s + (t.usedQuantity || 0), 0)
                    )
                }, 0)
                if (
                    prodGroup.total_quantity > 0 &&
                    prodGroup.total_quantity > total_used
                ) {
                    hasAvailable = true
                }
            })
            return {
                ...record,
                status: hasAvailable ? 'available' : 'unavailable',
            }
        })

        if (appliedFilters.status !== 'all') {
            result = result.filter(
                (item) => item.status === appliedFilters.status
            )
        }

        return result
    }

    const getTrackerGroupedData = () => {
        let linesToGroup = trackerData
        if (selectedDistinctRecord) {
            linesToGroup = linesToGroup.filter((item) => {
                const bundleId = item.bundle_id?._id || 'null'
                const packingId = item.packing_id?._id || 'null'
                const brandId = item.brand_id?._id || 'null'
                const buyerId =
                    item.buyer_id?._id || item.order_id?.buyer_id || 'null'
                const rec = selectedDistinctRecord
                const rBundleId = rec.bundle?._id || 'null'
                const rPackingId = rec.packing?._id || 'null'
                const rBrandId = rec.brand?._id || 'null'
                const rBuyerId = rec.buyer?._id || 'null'
                return (
                    bundleId === rBundleId &&
                    packingId === rPackingId &&
                    brandId === rBrandId &&
                    buyerId === rBuyerId
                )
            })
        }

        const grouped = {}
        linesToGroup.forEach((item) => {
            const productId = item.product_id?._id || 'unknown'
            if (!grouped[productId]) {
                grouped[productId] = {
                    key: productId,
                    product_name: item.product_id?.name || 'Chưa xác định',
                    total_quantity: 0,
                    lines: [],
                }
            }
            grouped[productId].total_quantity += item.quantity || 0
            grouped[productId].lines.push({
                ...item,
                key: item._id,
            })
        })

        // Tính total_used từ uqtTransactions
        let result = Object.values(grouped).map((group) => {
            const total_used = group.lines.reduce((sum, line) => {
                const txns = uqtTransactions[line._id] || []
                return sum + txns.reduce((s, t) => s + (t.usedQuantity || 0), 0)
            }, 0)
            const remaining = group.total_quantity - total_used
            return { ...group, total_used, remaining }
        })

        return result
    }

    const trackerColumns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'product_name',
            key: 'product_name',
            render: (text, record) => {
                const isFull =
                    record.total_quantity > 0 &&
                    record.total_quantity <= record.total_used
                return (
                    <span
                        style={{
                            fontWeight: 'bold',
                            color: !isFull ? '#2e7d32' : 'inherit',
                        }}
                    >
                        {text}
                    </span>
                )
            },
        },
        {
            title: 'Tổng số lượng đơn hàng',
            dataIndex: 'total_quantity',
            key: 'total_quantity',
            align: 'right',
            render: (val) => Intl.NumberFormat().format(val),
        },
        {
            title: 'Tổng số lượng đã sử dụng',
            dataIndex: 'total_used',
            key: 'total_used',
            align: 'right',
            render: (val) => Intl.NumberFormat().format(val),
        },
        {
            title: 'Tổng số lượng còn lại',
            dataIndex: 'remaining',
            key: 'remaining',
            align: 'right',
            render: (val) => Intl.NumberFormat().format(val),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            align: 'center',
            render: (_, record) => {
                const isFull =
                    record.total_quantity > 0 &&
                    record.total_quantity <= record.total_used
                return (
                    <Tag color={isFull ? 'warning' : 'success'}>
                        {isFull ? 'Không có sẵn' : 'Tồn kho'}
                    </Tag>
                )
            },
        },
    ]

    const expandedRowRender = (record) => {
        const lineColumns = [
            {
                title: 'Mã đơn hàng',
                dataIndex: 'order_id',
                key: 'order',
                render: (po) => po?.name,
            },
            {
                title: 'Ngày đặt hàng',
                dataIndex: 'order_id',
                key: 'date_ordered',
                render: (po) =>
                    po?.date_ordered
                        ? dayjs(po.date_ordered).format('DD/MM/YYYY')
                        : '-',
            },
            {
                title: 'Ngày giao hàng',
                dataIndex: 'order_id',
                key: 'date_deliveried',
                render: (po) =>
                    po?.date_deliveried
                        ? dayjs(po.date_deliveried).format('DD/MM/YYYY')
                        : '-',
            },
            {
                title: 'Số lượng đơn hàng',
                dataIndex: 'quantity',
                key: 'quantity',
                align: 'right',
                render: (val) => Intl.NumberFormat().format(val),
            },
            {
                title: 'Số lượng đã sử dụng',
                key: 'line_used_qty',
                align: 'right',
                render: (_, row) => {
                    const txns = uqtTransactions[row._id] || []
                    const total = txns.reduce(
                        (s, t) => s + (t.usedQuantity || 0),
                        0
                    )
                    return Intl.NumberFormat().format(total)
                },
            },
            {
                title: 'Danh sách Hợp đồng',
                dataIndex: 'contract_id',
                key: 'contract_list',
                render: (vals) => {
                    if (!vals || vals.length === 0) return <span>-</span>
                    return (
                        <span>
                            {vals.map((v) => {
                                const code = v?.code || v
                                return (
                                    <Tag key={v?._id || v} color="blue">
                                        {code}
                                    </Tag>
                                )
                            })}
                        </span>
                    )
                },
            },
            {
                title: 'Hành động',
                key: 'line_action',
                align: 'center',
                width: 90,
                render: (_, row) => (
                    <Button
                        size="small"
                        type="primary"
                        icon={<FaCirclePlus />}
                        onClick={() => {
                            setUqtTargetLine(row)
                            setUqtForm({
                                usedQuantity: null,
                                usedDate: null,
                                usedForContractId: null,
                            })
                            if (!uqtTransactions[row._id]) {
                                fetchUqtByLine(row._id)
                            }
                            setUqtModalVisible(true)
                        }}
                    >
                        Tạo
                    </Button>
                ),
            },
        ]

        const transactionColumns = [
            {
                key: 'label',
                width: 40,
                render: () => null,
            },
            {
                title: 'Ngày sử dụng',
                dataIndex: 'usedDate',
                key: 'usedDate',
                render: (val) => (val ? dayjs(val).format('DD/MM/YYYY') : '-'),
            },
            {
                title: 'Hợp đồng sử dụng',
                dataIndex: 'usedForContractId',
                key: 'usedForContractId',
                render: (val) => (val ? <Tag>{val.code}</Tag> : <span>-</span>),
            },
            {
                title: 'Số lượng sử dụng',
                dataIndex: 'usedQuantity',
                key: 'usedQuantity',
                render: (val) => Intl.NumberFormat().format(val),
            },
            {
                title: '',
                key: 'txn_action',
                align: 'center',
                width: 90,
                render: (_, txn) => (
                    <Space>
                        <Button
                            size="small"
                            icon={<EditFilled />}
                            onClick={() => {
                                setUqtEditTarget(txn)
                                setUqtEditForm({
                                    usedQuantity: txn.usedQuantity ?? null,
                                    usedDate: txn.usedDate
                                        ? dayjs(txn.usedDate)
                                        : null,
                                    usedForContractId:
                                        txn.usedForContractId?._id ||
                                        txn.usedForContractId ||
                                        null,
                                })
                                setUqtEditModalVisible(true)
                            }}
                        />
                        <Button
                            size="small"
                            danger
                            icon={<DeleteFilled />}
                            onClick={() =>
                                handleDeleteUqt(
                                    txn._id,
                                    txn.purchase_order_line_id
                                )
                            }
                        />
                    </Space>
                ),
            },
        ]

        const innerExpandedRowRender = (lineRow) => {
            const txns = uqtTransactions[lineRow._id] || []
            if (txns.length === 0) {
                return (
                    <div
                        style={{
                            padding: '8px 16px',
                            color: '#999',
                            fontStyle: 'italic',
                        }}
                    >
                        Chưa có giao dịch nào
                    </div>
                )
            }
            return (
                <Table
                    columns={transactionColumns}
                    dataSource={txns.map((t) => ({ ...t, key: t._id }))}
                    pagination={false}
                    size="small"
                    showHeader
                    style={{ marginLeft: 48 }}
                />
            )
        }

        return (
            <Table
                columns={lineColumns}
                dataSource={record.lines}
                pagination={false}
                size="small"
                rowKey="_id"
                expandable={{
                    expandedRowRender: innerExpandedRowRender,
                    onExpand: (expanded, lineRow) => {
                        if (expanded) fetchUqtByLine(lineRow._id)
                    },
                }}
            />
        )
    }

    return (
        <div>
            {/* Modal tạo giao dịch sử dụng */}
            <Modal
                title="Tạo giao dịch sử dụng"
                open={uqtModalVisible}
                onOk={handleCreateUqt}
                onCancel={() => {
                    setUqtModalVisible(false)
                    setUqtForm({
                        usedQuantity: null,
                        usedDate: null,
                        usedForContractId: null,
                    })
                    setUqtTargetLine(null)
                }}
                confirmLoading={uqtSubmitting}
                okText="Tạo"
                cancelText="Hủy"
            >
                {uqtTargetLine &&
                    (() => {
                        const lineQty = uqtTargetLine.quantity || 0
                        const existingTxns =
                            uqtTransactions[uqtTargetLine._id] || []
                        const totalUsed = existingTxns.reduce(
                            (sum, t) => sum + (t.usedQuantity || 0),
                            0
                        )
                        const remaining = lineQty - totalUsed
                        return (
                            <div
                                style={{
                                    background:
                                        remaining <= 0 ? '#fff1f0' : '#f6ffed',
                                    border: `1px solid ${remaining <= 0 ? '#ffa39e' : '#b7eb8f'}`,
                                    borderRadius: 6,
                                    padding: '8px 12px',
                                    marginBottom: 16,
                                    display: 'flex',
                                    gap: 24,
                                    fontSize: 13,
                                }}
                            >
                                <span>
                                    <strong>Số lượng đơn:</strong>{' '}
                                    {Intl.NumberFormat().format(lineQty)}
                                </span>
                                <span>
                                    <strong>Đã sử dụng:</strong>{' '}
                                    {Intl.NumberFormat().format(totalUsed)}
                                </span>
                                <span
                                    style={{
                                        color:
                                            remaining <= 0
                                                ? '#cf1322'
                                                : '#389e0d',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    <strong>Còn lại:</strong>{' '}
                                    {Intl.NumberFormat().format(remaining)}
                                </span>
                            </div>
                        )
                    })()}
                <Form layout="vertical">
                    <Form.Item label="Số lượng sử dụng" required>
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            max={(() => {
                                if (!uqtTargetLine) return undefined
                                const lineQty = uqtTargetLine.quantity || 0
                                const existingTxns =
                                    uqtTransactions[uqtTargetLine._id] || []
                                const totalUsed = existingTxns.reduce(
                                    (sum, t) => sum + (t.usedQuantity || 0),
                                    0
                                )
                                return lineQty - totalUsed
                            })()}
                            value={uqtForm.usedQuantity}
                            onChange={(val) =>
                                setUqtForm((f) => ({ ...f, usedQuantity: val }))
                            }
                        />
                    </Form.Item>
                    <Form.Item label="Ngày sử dụng">
                        <DatePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            value={uqtForm.usedDate}
                            onChange={(date) =>
                                setUqtForm((f) => ({ ...f, usedDate: date }))
                            }
                        />
                    </Form.Item>
                    <Form.Item label="Sử dụng cho hợp đồng">
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Chọn hợp đồng"
                            prefix={
                                <Button
                                    size="small"
                                    color="primary"
                                    variant="solid"
                                    onClick={() =>
                                        setOpenMyContractDrawer(true)
                                    }
                                >
                                    <FaCirclePlus />
                                </Button>
                            }
                            allowClear
                            showSearch
                            value={uqtForm.usedForContractId}
                            onChange={(val) =>
                                setUqtForm((f) => ({
                                    ...f,
                                    usedForContractId: val,
                                }))
                            }
                            options={contracts.map((c) => ({
                                label: c.code,
                                value: c._id,
                            }))}
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal chỉnh sửa giao dịch sử dụng */}
            <Modal
                title="Chỉnh sửa giao dịch sử dụng"
                open={uqtEditModalVisible}
                onOk={handleUpdateUqt}
                onCancel={() => {
                    setUqtEditModalVisible(false)
                    setUqtEditTarget(null)
                }}
                confirmLoading={uqtEditSubmitting}
                okText="Lưu"
                cancelText="Hủy"
            >
                {uqtEditTarget &&
                    (() => {
                        const lineId =
                            uqtEditTarget.purchase_order_line_id?._id ||
                            uqtEditTarget.purchase_order_line_id
                        const lineRecord = trackerData.find(
                            (l) => l._id === lineId
                        )
                        const lineQty = lineRecord?.quantity || 0
                        const otherTxns = (
                            uqtTransactions[lineId] || []
                        ).filter((t) => t._id !== uqtEditTarget._id)
                        const otherTotal = otherTxns.reduce(
                            (s, t) => s + (t.usedQuantity || 0),
                            0
                        )
                        const remaining = lineQty - otherTotal
                        return (
                            <div
                                style={{
                                    background:
                                        remaining <= 0 ? '#fff1f0' : '#f6ffed',
                                    border: `1px solid ${remaining <= 0 ? '#ffa39e' : '#b7eb8f'}`,
                                    borderRadius: 6,
                                    padding: '8px 12px',
                                    marginBottom: 16,
                                    display: 'flex',
                                    gap: 24,
                                    fontSize: 13,
                                }}
                            >
                                <span>
                                    <strong>Số lượng đơn:</strong>{' '}
                                    {Intl.NumberFormat().format(lineQty)}
                                </span>
                                <span>
                                    <strong>Các record khác:</strong>{' '}
                                    {Intl.NumberFormat().format(otherTotal)}
                                </span>
                                <span
                                    style={{
                                        color:
                                            remaining <= 0
                                                ? '#cf1322'
                                                : '#389e0d',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    <strong>Tối đa:</strong>{' '}
                                    {Intl.NumberFormat().format(remaining)}
                                </span>
                            </div>
                        )
                    })()}
                <Form layout="vertical">
                    <Form.Item label="Số lượng sử dụng" required>
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            max={(() => {
                                if (!uqtEditTarget) return undefined
                                const lineId =
                                    uqtEditTarget.purchase_order_line_id?._id ||
                                    uqtEditTarget.purchase_order_line_id
                                const lineRecord = trackerData.find(
                                    (l) => l._id === lineId
                                )
                                const lineQty = lineRecord?.quantity || 0
                                const otherTxns = (
                                    uqtTransactions[lineId] || []
                                ).filter((t) => t._id !== uqtEditTarget._id)
                                const otherTotal = otherTxns.reduce(
                                    (s, t) => s + (t.usedQuantity || 0),
                                    0
                                )
                                return lineQty - otherTotal
                            })()}
                            value={uqtEditForm.usedQuantity}
                            onChange={(val) =>
                                setUqtEditForm((f) => ({
                                    ...f,
                                    usedQuantity: val,
                                }))
                            }
                        />
                    </Form.Item>
                    <Form.Item label="Ngày sử dụng">
                        <DatePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            value={uqtEditForm.usedDate}
                            onChange={(date) =>
                                setUqtEditForm((f) => ({
                                    ...f,
                                    usedDate: date,
                                }))
                            }
                        />
                    </Form.Item>
                    <Form.Item label="Sử dụng cho hợp đồng">
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Chọn hợp đồng"
                            allowClear
                            prefix={
                                <Button
                                    size="small"
                                    color="primary"
                                    variant="solid"
                                    onClick={() =>
                                        setOpenMyContractDrawer(true)
                                    }
                                >
                                    <FaCirclePlus />
                                </Button>
                            }
                            showSearch
                            value={uqtEditForm.usedForContractId}
                            onChange={(val) =>
                                setUqtEditForm((f) => ({
                                    ...f,
                                    usedForContractId: val,
                                }))
                            }
                            options={contracts.map((c) => ({
                                label: c.code,
                                value: c._id,
                            }))}
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Tabs defaultActiveKey="input" type="card">
                <Tabs.TabPane tab="Input" key="input">
                    <div
                        style={{
                            background: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                        }}
                    >
                        <Space>
                            <Button
                                type="primary"
                                onClick={() => setShowDrawer(true)}
                                style={{ marginBottom: 16 }}
                            >
                                Tạo đơn dự phòng
                            </Button>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputReceiptRef}
                                    style={{ display: 'none' }}
                                    onChange={handleImportReceiptDate}
                                />
                                <Button
                                    onClick={() => {
                                        fileInputReceiptRef.current.click()
                                    }}
                                    style={{ marginBottom: 16 }}
                                >
                                    Import ngày nhập kho
                                </Button>
                            </div>
                            {selectedRowKeys.length > 0 && (
                                <Button
                                    onClick={handleExportSummaryFile}
                                    style={{ marginBottom: 16 }}
                                >
                                    Xuất file tổng hợp
                                </Button>
                            )}
                        </Space>
                        <Table
                            columns={columns}
                            rowSelection={rowSelection}
                            size="small"
                            rowKey={(record) => record._id}
                            pagination={{
                                defaultPageSize: 15,
                                showSizeChanger: true,
                            }}
                            scroll={{ x: 'max-content' }}
                            dataSource={getFilteredData().map((i) => {
                                let contractString = ''
                                const contractList = i.contract_id
                                for (let k = 0; k < contractList.length; k++) {
                                    if (k === contractList.length - 1) {
                                        contractString =
                                            contractString +
                                            contractList[k]?.code
                                    } else {
                                        contractString =
                                            contractString +
                                            contractList[k]?.code +
                                            ', '
                                    }
                                }
                                return {
                                    ...i,
                                    partner: i?.partner_id?.short_name,
                                    pr: i?.pr_id?.name,
                                    buyer: i?.buyer_id?.name,
                                    contract: contractString,
                                }
                            })}
                        />
                    </div>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Output" key="output">
                    <div
                        style={{
                            background: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: '16px',
                                marginBottom: '24px',
                                flexWrap: 'wrap',
                            }}
                        >
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: '#8c8c8c',
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Khách hàng
                                </div>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Chọn khách hàng"
                                    value={trackerFilters.buyer_id}
                                    onChange={(val) =>
                                        setTrackerFilters({
                                            ...trackerFilters,
                                            buyer_id: val,
                                        })
                                    }
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    options={[
                                        {
                                            value: 'all',
                                            label: 'Tất cả khách hàng',
                                        },
                                        ...partners.map((p) => ({
                                            value: p._id,
                                            label: p.name,
                                        })),
                                    ]}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: '#8c8c8c',
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Mặt hàng
                                </div>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Chọn mặt hàng"
                                    value={trackerFilters.bundle_id}
                                    onChange={(val) =>
                                        setTrackerFilters({
                                            ...trackerFilters,
                                            bundle_id: val,
                                        })
                                    }
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    options={[
                                        {
                                            value: 'all',
                                            label: 'Tất cả mặt hàng',
                                        },
                                        ...bundles.map((b) => ({
                                            value: b._id,
                                            label: b.name,
                                        })),
                                    ]}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: '#8c8c8c',
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Brand
                                </div>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Chọn brand"
                                    value={trackerFilters.brand_id}
                                    onChange={(val) =>
                                        setTrackerFilters({
                                            ...trackerFilters,
                                            brand_id: val,
                                        })
                                    }
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    options={[
                                        { value: 'all', label: 'Tất cả brand' },
                                        ...brands.map((b) => ({
                                            value: b._id,
                                            label: b.name,
                                        })),
                                    ]}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: '#8c8c8c',
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Packing
                                </div>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Chọn packing"
                                    value={trackerFilters.packing_id}
                                    onChange={(val) =>
                                        setTrackerFilters({
                                            ...trackerFilters,
                                            packing_id: val,
                                        })
                                    }
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    options={[
                                        {
                                            value: 'all',
                                            label: 'Tất cả packing',
                                        },
                                        ...packings.map((p) => ({
                                            value: p._id,
                                            label: p.name,
                                        })),
                                    ]}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: '#8c8c8c',
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Trạng thái
                                </div>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Chọn trạng thái"
                                    value={trackerFilters.status}
                                    onChange={(val) =>
                                        setTrackerFilters({
                                            ...trackerFilters,
                                            status: val,
                                        })
                                    }
                                    options={[
                                        {
                                            value: 'all',
                                            label: 'Tất cả trạng thái',
                                        },
                                        {
                                            value: 'available',
                                            label: 'Tồn kho',
                                        },
                                        {
                                            value: 'unavailable',
                                            label: 'Không có sẵn',
                                        },
                                    ]}
                                />
                            </div>
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                size="middle"
                                onClick={fetchTrackerData}
                                loading={trackerLoading}
                            >
                                Theo dõi
                            </Button>
                        </div>

                        {/* <style>{`
                            .tracker-table-xs .ant-table-cell {
                                padding: 4px 8px !important;
                                font-size: 12px !important;
                            }
                            .tracker-table-xs .ant-table-thead > tr > th {
                                padding: 4px 8px !important;
                                font-size: 11px !important;
                            }
                        `}</style> */}
                        <Table
                            className="tracker-table-xs"
                            columns={distinctColumns}
                            dataSource={getFilteredDistinctRecords()}
                            size="small"
                            pagination={false}
                            loading={trackerLoading}
                            onRow={(record) => ({
                                onClick: () => {
                                    setSelectedDistinctRecord(record)
                                    setTrackingDetailModalVisible(true)
                                },
                                style: { cursor: 'pointer' },
                            })}
                        />
                        <Modal
                            title="Chi tiết theo dõi"
                            open={trackingDetailModalVisible}
                            onCancel={() => {
                                setTrackingDetailModalVisible(false)
                                setSelectedDistinctRecord(null)
                            }}
                            footer={null}
                            width={1000}
                        >
                            <Table
                                className="tracker-table-xs"
                                columns={trackerColumns}
                                dataSource={getTrackerGroupedData()}
                                expandable={{
                                    expandedRowRender,
                                }}
                                size="small"
                                pagination={false}
                                loading={trackerLoading}
                            />
                        </Modal>
                    </div>
                </Tabs.TabPane>
            </Tabs>
            {openMyContractDrawer && (
                <MyContractDrawer
                    open={openMyContractDrawer}
                    onClose={() => setOpenMyContractDrawer(false)}
                    getContracts={getContracts}
                />
            )}
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

export default BackupPurchaseOrder

const MyDrawer = ({ open, onClose, getPos }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')
    const searchInput = useRef(null)
    const [showPurchaseOrderLineDrawer, setShowPurchaseOrderLineDrawer] =
        useState(false)
    const {
        partners,
        po_lines,
        setPoLineState,
        contracts,
        setPartnerState,
        setContractState,
    } = useZustand()
    const [openMyPartnerDrawer, setOpenMyPartnerDrawer] = useState(false)
    const [filteredContracts, setFilteredContracts] = useState(contracts)
    const [openMyContractDrawer, setOpenMyContractDrawer] = useState(false)

    const handleGetRespectiveLines = async () => {
        try {
            if (!open?._id) return setPoLineState([])
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

    const getPartners = async () => {
        try {
            const { data } = await axios.get('/api/get-partners')
            setPartnerState(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

    const getContracts = async () => {
        try {
            const { data } = await axios.get('/api/get-contracts')
            setContractState(data.data)

            if (form.getFieldValue('buyer_id')) {
                const filtered = data.data.filter(
                    (i) => i.partner_id?._id === form.getFieldValue('buyer_id')
                )
                setFilteredContracts(filtered)
            } else {
                setFilteredContracts(data.data)
            }
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

    const handleOk = async () => {
        try {
            const {
                name,
                replacedForContract,
                pr_name,
                partner_id,
                date,
                customer_id,
                date_deliveried,
                delivered_to,
                date_ordered,
                active,
                contract_id,
                buyer_id,
            } = form.getFieldsValue()

            if (
                (!name && open?._id) ||
                (!pr_name && open?._id) ||
                !replacedForContract ||
                !partner_id ||
                !date_ordered ||
                !date ||
                !customer_id
            )
                return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)

            let po_id_created
            if (open?._id) {
                await axios.patch(`/api/update-po/${open._id}`, {
                    name,
                    replacedForContract,
                    pr_name,
                    partner_id,
                    date,
                    date_deliveried,
                    delivered_to,
                    customer_id,
                    date_ordered,
                    active,
                    contract_id,
                    buyer_id,
                    is_backup: true,
                })
            } else {
                const { data } = await axios.post('/api/create-po', {
                    name,
                    replacedForContract,
                    pr_name,
                    partner_id,
                    customer_id,
                    date,
                    date_deliveried,
                    delivered_to,
                    date_ordered,
                    contract_id,
                    buyer_id,
                    is_backup: true,
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

    const handleDuplicate = async () => {
        try {
            if (!open?._id)
                return alert('Chỉ có thể nhân bản đơn dự phòng đã lưu')

            if (!window.confirm('Bạn có chắc muốn nhân bản đơn dự phòng này?'))
                return

            const {
                name,
                replacedForContract,
                pr_name,
                partner_id,
                date,
                customer_id,
                date_deliveried,
                delivered_to,
                date_ordered,
                active,
                contract_id,
                buyer_id,
            } = form.getFieldsValue()

            if (
                (!name && open?._id) ||
                (!pr_name && open?._id) ||
                !replacedForContract ||
                !partner_id ||
                !date_ordered ||
                !date ||
                !customer_id
            )
                return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            const { data } = await axios.post('/api/create-po', {
                name,
                replacedForContract,
                pr_name,
                partner_id,
                customer_id,
                date,
                date_deliveried,
                delivered_to,
                date_ordered,
                contract_id,
                buyer_id,
                is_backup: true,
            })
            let po_id_created = data?.data?._id
            if (po_id_created) {
                const lines = po_lines.map((item) =>
                    axios.post('/api/create-po-line', {
                        order_id: po_id_created,
                        product_id: item.product_id,
                        uom_id: item.uom_id,
                        quy_cach: item.quy_cach,
                        buyer_id: item.buyer_id,
                        contract_id: item.contract_id,
                        contract_quantity: item.contract_quantity,
                        need_quantity: item.need_quantity,
                        kho_tong: item.kho_tong,
                        quotation_date: item.quotation_date,
                        loss_rate: item.loss_rate,
                        note: item.note,
                        standard: item.standard,
                        quantity: item.quantity,
                        price_unit: item.price_unit,
                        sub_total: item.sub_total,
                        brand_id: item.brand_id,
                        bundle_id: item.bundle_id,
                        packing_id: item.packing_id,
                    })
                )
                await Promise.all(lines)
            }
            const result = await getPos(po_id_created)
            if (!result) {
                onClose()
            }
            alert('Đã nhân bản thành công!')
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
            form.setFieldValue('replacedForContract', open?.replacedForContract)
            form.setFieldValue('partner_id', open?.partner_id?._id)
            form.setFieldValue('customer_id', open?.customer_id?._id)
            form.setFieldValue('pr_name', open?.pr_name)
            form.setFieldValue('date_ordered', dayjs(open?.date_ordered))
            form.setFieldValue('date', dayjs(open?.date))
            form.setFieldValue('buyer_id', open?.buyer_id?._id)
            form.setFieldValue(
                'contract_id',
                open?.contract_id?.map((i) => i._id)
            )
            form.setFieldValue(
                'date_deliveried',
                open?.date_deliveried ? dayjs(open?.date_deliveried) : null
            )
            form.setFieldValue('delivered_to', open?.delivered_to)
        } else {
            const myCompany = partners.find((i) => i.isMyCompany)
            form.setFieldValue('date', dayjs(new Date()))
            form.setFieldValue('customer_id', myCompany?._id)
            form.setFieldValue('date_ordered', dayjs(new Date()))
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
            width: 200,
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
            dataIndex: 'standard',
            width: 180,
            key: 'standard',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'buyer',
            key: 'buyer',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('buyer'),
        },
        {
            title: 'Hợp đồng',
            dataIndex: 'contract',
            key: 'contract',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('contract'),
        },
        {
            title: 'Ngày báo giá',
            dataIndex: 'quotation_date',
            key: 'quotation_date',
            align: 'right',
            sorter: (a, b) =>
                moment(a.quotation_date) - moment(b.quotation_date),
            render: (value) =>
                value ? (
                    <span>{moment(value).format('DD/MM/YYYY')}</span>
                ) : undefined,
        },
        {
            title: 'SL theo HĐ',
            dataIndex: 'contract_quantity',
            key: 'contract_quantity',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'Kho tổng',
            dataIndex: 'kho_tong',
            key: 'kho_tong',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'SL cần thêm',
            dataIndex: 'sl_can_them',
            key: 'sl_can_them',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: '% hao hụt',
            dataIndex: 'loss_rate',
            key: 'loss_rate',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'SL cần mua',
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
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Mặt hàng',
            dataIndex: 'bundle',
            key: 'bundle',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Packing',
            dataIndex: 'packing',
            key: 'packing',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Hành động',
            fixed: 'right',
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
            title={
                open?._id ? 'Chỉnh sửa đơn dự phòng' : 'Tạo mới đơn dự phòng'
            }
            closable={{ 'aria-label': 'Close Button' }}
            onClose={onClose}
            open={open}
            width={'100%'}
            extra={
                <Space>
                    {open?._id && (
                        <Button
                            icon={<IoDuplicate />}
                            onClick={handleDuplicate}
                            loading={loading}
                            disabled={loading}
                        >
                            Nhân bản
                        </Button>
                    )}
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
                        name="pr_name"
                        label="Mã đề nghị mua hàng dự phòng"
                    >
                        <Input className="w-full" disabled={!open?._id} />
                    </Form.Item>
                    <Form.Item
                        style={{ flex: 1 }}
                        name="name"
                        label="Mã đơn mua hàng dự phòng"
                    >
                        <Input className="w-full" disabled={!open?._id} />
                    </Form.Item>
                </Space.Compact>
                <Space.Compact style={{ display: 'flex' }}>
                    <Form.Item
                        style={{ flex: 1 }}
                        name="contract_id"
                        label="Hợp đồng"
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            prefix={
                                <Button
                                    size="small"
                                    color="primary"
                                    variant="solid"
                                    onClick={() =>
                                        setOpenMyContractDrawer(true)
                                    }
                                >
                                    <FaCirclePlus />
                                </Button>
                            }
                            showSearch
                            onChange={(e) => {
                                if (e.length === 1) {
                                    const myContract = contracts.find(
                                        (item) => item._id === e[0]
                                    )

                                    if (myContract) {
                                        let code = myContract.code.slice(2, 5)
                                        const respectivePartner =
                                            partners?.find(
                                                (item) => item.code === code
                                            )
                                        if (respectivePartner) {
                                            form.setFieldValue(
                                                'buyer_id',
                                                respectivePartner?._id
                                            )
                                            const filterData = contracts.filter(
                                                (i) =>
                                                    i?.partner_id?._id ===
                                                    respectivePartner?._id
                                            )
                                            setFilteredContracts(filterData)
                                        }
                                    }
                                }
                            }}
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={filteredContracts.map((i) => {
                                return { value: i._id, label: i.code }
                            })}
                        />
                    </Form.Item>
                    <Form.Item
                        name="buyer_id"
                        style={{ flex: 1 }}
                        label="Khách hàng"
                    >
                        <Select
                            showSearch
                            prefix={
                                <Space>
                                    <Button
                                        size="small"
                                        color="primary"
                                        variant="solid"
                                        onClick={() =>
                                            setOpenMyPartnerDrawer(true)
                                        }
                                    >
                                        <FaCirclePlus />
                                    </Button>
                                    <Button
                                        size="small"
                                        color="primary"
                                        variant="solid"
                                        onClick={() => {
                                            const value =
                                                form.getFieldValue('buyer_id')
                                            const respectivePartner =
                                                partners.find(
                                                    (item) => item._id === value
                                                )
                                            if (respectivePartner) {
                                                setOpenMyPartnerDrawer(
                                                    respectivePartner
                                                )
                                            }
                                        }}
                                    >
                                        <MdModeEdit />
                                    </Button>
                                </Space>
                            }
                            allowClear
                            onChange={(e) => {
                                if (e) {
                                    const filtered = contracts.filter(
                                        (i) => i.partner_id?._id === e
                                    )
                                    setFilteredContracts(filtered)
                                } else {
                                    setFilteredContracts(contracts)
                                }
                            }}
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
                            prefix={
                                <Space>
                                    <Button
                                        size="small"
                                        color="primary"
                                        variant="solid"
                                        onClick={() =>
                                            setOpenMyPartnerDrawer(true)
                                        }
                                    >
                                        <FaCirclePlus />
                                    </Button>
                                    <Button
                                        size="small"
                                        color="primary"
                                        variant="solid"
                                        onClick={() => {
                                            const value =
                                                form.getFieldValue('partner_id')
                                            const respectivePartner =
                                                partners.find(
                                                    (item) => item._id === value
                                                )
                                            if (respectivePartner) {
                                                setOpenMyPartnerDrawer(
                                                    respectivePartner
                                                )
                                            }
                                        }}
                                    >
                                        <MdModeEdit />
                                    </Button>
                                </Space>
                            }
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            onChange={(e) => {
                                const current_partner = partners.find(
                                    (i) => i._id === e
                                )
                                if (current_partner) {
                                    form.setFieldValue(
                                        'replacedForContract',
                                        current_partner?.replacedForContract
                                    )
                                }
                            }}
                            options={partners.map((i) => {
                                return { value: i._id, label: i.name }
                            })}
                        />
                    </Form.Item>
                    <Form.Item
                        style={{ flex: 1 }}
                        name="replacedForContract"
                        label="Thay thế cho hợp đồng nguyên tắc"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item
                        style={{ flex: 1 }}
                        name="customer_id"
                        label="Công ty của tôi"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            disabled
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
                        name="quotation_date"
                        style={{ flex: 1 }}
                        label="Ngày báo giá mặc định"
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="date"
                        style={{ flex: 1 }}
                        label="Ngày đề nghị đặt hàng"
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
                    <Form.Item
                        name="date_deliveried"
                        style={{ flex: 1 }}
                        label="Ngày giao hàng"
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Space.Compact>

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
                    po_lines={po_lines}
                    outerForm={form}
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
                    let contractString = ''
                    const contractList = i.contract_id
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
                        product: i?.product_id?.name,
                        uom: i?.uom_id?.name,
                        buyer: i?.buyer_id?.name,
                        contract: contractString,
                        sl_can_them: i.contract_quantity - i.kho_tong,
                        brand: i?.brand_id?.name,
                        bundle: i?.bundle_id?.name,
                        packing: i?.packing_id?.name,
                    }
                })}
            />

            {openMyPartnerDrawer && (
                <MyPartnerDrawer
                    open={openMyPartnerDrawer}
                    onClose={() => setOpenMyPartnerDrawer(false)}
                    getPartners={getPartners}
                />
            )}

            {openMyContractDrawer && (
                <MyContractDrawer
                    open={openMyContractDrawer}
                    onClose={() => setOpenMyContractDrawer(false)}
                    getContracts={getContracts}
                />
            )}
        </Drawer>
    )
}

const MyPurchaseRequestLineDrawer = ({
    open,
    onClose,
    pr_id,
    po_lines,
    handleGetRespectiveLines,
    getPos,
    outerForm,
}) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const {
        products,
        uoms,
        setProductState,
        setContractState,
        setPartnerState,
        partners,
        contracts,
        brands,
        bundles,
        packings,
        setBrandState,
        setBundleState,
        setPackingState,
    } = useZustand()
    const [openMyProductDrawer, setOpenMyProductDrawer] = useState(false)
    const [filteredContracts, setFilteredContracts] = useState(contracts)
    const [openMyContractDrawer, setOpenMyContractDrawer] = useState(false)
    const [openMyPartnerDrawer, setOpenMyPartnerDrawer] = useState(false)
    const [openMyBrandDrawer, setOpenMyBrandDrawer] = useState(false)
    const [openMyBundleDrawer, setOpenMyBundleDrawer] = useState(false)
    const [openMyPackingDrawer, setOpenMyPackingDrawer] = useState(false)

    const getBrands = async () => {
        try {
            const { data } = await axios.get('/api/get-brands')
            setBrandState(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

    const getBundles = async () => {
        try {
            const { data } = await axios.get('/api/get-bundles')
            setBundleState(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

    const getPackings = async () => {
        try {
            const { data } = await axios.get('/api/get-packings')
            setPackingState(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

    const handleOk = async () => {
        try {
            const {
                order_id,
                product_id,
                uom_id,
                quy_cach,
                contract_quantity,
                need_quantity,
                kho_tong,
                loss_rate,
                note,
                contract_id,
                standard,
                quotation_date,
                quantity,
                price_unit,
                buyer_id,
                sub_total,
                brand_id,
                bundle_id,
                packing_id,
            } = form.getFieldsValue()
            if (!product_id || !packing_id)
                return alert(
                    'Vui lòng nhập đầy đủ thông tin bắt buộc (sản phẩm, quy cách đóng gói)'
                )

            setLoading(true)

            if (open?._id) {
                await axios.patch(`/api/update-po-line/${open._id}`, {
                    order_id,
                    product_id,
                    uom_id,
                    quy_cach,
                    contract_quantity,
                    need_quantity,
                    kho_tong,
                    quotation_date,
                    loss_rate,
                    buyer_id,
                    contract_id,
                    note,
                    standard,
                    quantity,
                    price_unit,
                    sub_total,
                    brand_id,
                    bundle_id,
                    packing_id,
                })
            } else {
                await axios.post('/api/create-po-line', {
                    order_id: pr_id,
                    product_id,
                    uom_id,
                    quy_cach,
                    buyer_id,
                    contract_id,
                    contract_quantity,
                    need_quantity,
                    kho_tong,
                    quotation_date,
                    loss_rate,
                    note,
                    standard,
                    quantity,
                    price_unit,
                    sub_total,
                    brand_id,
                    bundle_id,
                    packing_id,
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

    const getProducts = async () => {
        try {
            const { data } = await axios.get('/api/get-products')
            setProductState(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

    const getPartners = async () => {
        try {
            const { data } = await axios.get('/api/get-partners')
            setPartnerState(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

    const getContracts = async () => {
        try {
            const { data } = await axios.get('/api/get-contracts')
            setContractState(data.data)

            if (form.getFieldValue('buyer_id')) {
                const filtered = data.data.filter(
                    (i) => i.partner_id?._id === form.getFieldValue('buyer_id')
                )
                setFilteredContracts(filtered)
            } else {
                setFilteredContracts(data.data)
            }
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
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
            form.setFieldValue('quantity', open?.quantity)
            form.setFieldValue('price_unit', open?.price_unit)
            form.setFieldValue('sub_total', open?.sub_total)
            form.setFieldValue('note', open?.note)
            form.setFieldValue('standard', open?.standard)
            form.setFieldValue('loss_rate', open?.loss_rate)
            form.setFieldValue('kho_tong', open?.kho_tong)
            form.setFieldValue('contract_quantity', open?.contract_quantity)
            form.setFieldValue('quy_cach', open?.quy_cach)
            form.setFieldValue('buyer_id', open?.buyer_id?._id)
            form.setFieldValue(
                'contract_id',
                open?.contract_id?.map((i) => i._id)
            )
            form.setFieldValue(
                'quotation_date',
                open?.quotation_date ? dayjs(open?.quotation_date) : undefined
            )
            form.setFieldValue('brand_id', open?.brand_id?._id)
            form.setFieldValue('bundle_id', open?.bundle_id?._id)
            form.setFieldValue('packing_id', open?.packing_id?._id)
            const contract_quantity = form.getFieldValue('contract_quantity')
            const kho_tong = form.getFieldValue('kho_tong')
            form.setFieldValue(
                'theoritical_quantity',
                contract_quantity - kho_tong
            )

            if (open?.buyer_id?._id) {
                const filtered = contracts.filter(
                    (i) => i.partner_id?._id === open?.buyer_id?._id
                )
                setFilteredContracts(filtered)
            } else {
                setFilteredContracts(contracts)
            }
            calculatePrice()
        } else {
            form.setFieldValue('quantity', 0)
            form.setFieldValue('price_unit', 0)
            form.setFieldValue('sub_total', 0)
            form.setFieldValue('contract_quantity', 0)
            form.setFieldValue('loss_rate', 0)
            form.setFieldValue('kho_tong', 0)
        }
    }, [])

    const calculateTotalStock = () => {
        const contract_quantity = form.getFieldValue('contract_quantity')
        const loss_rate = form.getFieldValue('loss_rate')

        const kho_tong = form.getFieldValue('kho_tong')
        form.setFieldValue('theoritical_quantity', contract_quantity - kho_tong)
        form.setFieldValue(
            'quantity',
            Math.round(
                contract_quantity -
                    kho_tong +
                    (loss_rate * (contract_quantity - kho_tong)) / 100
            )
        )

        calculatePrice()
    }

    useEffect(() => {
        if (!open?._id) {
            const outerPartner = outerForm?.getFieldValue('buyer_id')
            if (outerPartner) {
                form.setFieldValue('buyer_id', outerPartner)
            }

            const outerContract = outerForm?.getFieldValue('contract_id')
            if (outerContract) {
                form.setFieldValue('contract_id', outerContract)
            }

            const outerQuotationDate =
                outerForm?.getFieldValue('quotation_date')
            if (outerQuotationDate) {
                form.setFieldValue('quotation_date', outerQuotationDate)
            }
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
                <Row gutter={[16, 0]}>
                    <Col span={12}>
                        <Form.Item
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
                                allowClear
                                prefix={
                                    <Space>
                                        <Button
                                            size="small"
                                            color="primary"
                                            variant="solid"
                                            onClick={() =>
                                                setOpenMyProductDrawer(true)
                                            }
                                        >
                                            <FaCirclePlus />
                                        </Button>
                                        <Button
                                            size="small"
                                            color="primary"
                                            variant="solid"
                                            onClick={() => {
                                                const value =
                                                    form.getFieldValue(
                                                        'product_id'
                                                    )
                                                const respectivePartner =
                                                    products.find(
                                                        (item) =>
                                                            item._id === value
                                                    )
                                                if (respectivePartner) {
                                                    setOpenMyProductDrawer(
                                                        respectivePartner
                                                    )
                                                }
                                            }}
                                        >
                                            <MdModeEdit />
                                        </Button>
                                    </Space>
                                }
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
                                            'quy_cach',
                                            respectiveProduct.quy_cach
                                        )
                                        form.setFieldValue(
                                            'standard',
                                            respectiveProduct.standard
                                        )
                                    }
                                }}
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={products
                                    .filter((i) => i.active)
                                    .map((i) => {
                                        return {
                                            value: i._id,
                                            label: i.name,
                                        }
                                    })}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="uom_id" label="ĐVT">
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
                    </Col>
                    <Col span={6}>
                        <Form.Item name="quy_cach" label="Quy cách">
                            <Input className="w-full" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item name="brand_id" label="Brand">
                            <Select
                                allowClear
                                showSearch
                                prefix={
                                    <Space>
                                        <Button
                                            size="small"
                                            color="primary"
                                            variant="solid"
                                            onClick={() =>
                                                setOpenMyBrandDrawer(true)
                                            }
                                        >
                                            <FaCirclePlus />
                                        </Button>
                                        <Button
                                            size="small"
                                            color="primary"
                                            variant="solid"
                                            onClick={() => {
                                                const value =
                                                    form.getFieldValue(
                                                        'brand_id'
                                                    )
                                                const respectiveBrand =
                                                    brands.find(
                                                        (item) =>
                                                            item._id === value
                                                    )
                                                if (respectiveBrand) {
                                                    setOpenMyBrandDrawer(
                                                        respectiveBrand
                                                    )
                                                }
                                            }}
                                        >
                                            <MdModeEdit />
                                        </Button>
                                    </Space>
                                }
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={brands.map((i) => ({
                                    value: i._id,
                                    label: i.name,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="bundle_id" label="Mặt hàng">
                            <Select
                                allowClear
                                showSearch
                                prefix={
                                    <Space>
                                        <Button
                                            size="small"
                                            color="primary"
                                            variant="solid"
                                            onClick={() =>
                                                setOpenMyBundleDrawer(true)
                                            }
                                        >
                                            <FaCirclePlus />
                                        </Button>
                                        <Button
                                            size="small"
                                            color="primary"
                                            variant="solid"
                                            onClick={() => {
                                                const value =
                                                    form.getFieldValue(
                                                        'bundle_id'
                                                    )
                                                const respectiveBundle =
                                                    bundles.find(
                                                        (item) =>
                                                            item._id === value
                                                    )
                                                if (respectiveBundle) {
                                                    setOpenMyBundleDrawer(
                                                        respectiveBundle
                                                    )
                                                }
                                            }}
                                        >
                                            <MdModeEdit />
                                        </Button>
                                    </Space>
                                }
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={bundles.map((i) => ({
                                    value: i._id,
                                    label: i.name,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="packing_id"
                            label="Packing"
                            rules={[
                                {
                                    required: true,
                                    message: 'Hãy chọn quy cách đóng gói',
                                },
                            ]}
                        >
                            <Select
                                allowClear
                                showSearch
                                prefix={
                                    <Space>
                                        <Button
                                            size="small"
                                            color="primary"
                                            variant="solid"
                                            onClick={() =>
                                                setOpenMyPackingDrawer(true)
                                            }
                                        >
                                            <FaCirclePlus />
                                        </Button>
                                        <Button
                                            size="small"
                                            color="primary"
                                            variant="solid"
                                            onClick={() => {
                                                const value =
                                                    form.getFieldValue(
                                                        'packing_id'
                                                    )
                                                const respectivePacking =
                                                    packings.find(
                                                        (item) =>
                                                            item._id === value
                                                    )
                                                if (respectivePacking) {
                                                    setOpenMyPackingDrawer(
                                                        respectivePacking
                                                    )
                                                }
                                            }}
                                        >
                                            <MdModeEdit />
                                        </Button>
                                    </Space>
                                }
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={packings.map((i) => ({
                                    value: i._id,
                                    label: i.name,
                                }))}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="contract_id"
                            label="Hợp đồng"
                            rules={[
                                {
                                    required: true,
                                    message: 'Hãy chọn hợp đồng',
                                },
                            ]}
                        >
                            <Select
                                mode="multiple"
                                allowClear
                                prefix={
                                    <Button
                                        size="small"
                                        color="primary"
                                        variant="solid"
                                        onClick={() =>
                                            setOpenMyContractDrawer(true)
                                        }
                                    >
                                        <FaCirclePlus />
                                    </Button>
                                }
                                showSearch
                                onChange={(e) => {
                                    if (e.length === 1) {
                                        const myContract = contracts.find(
                                            (item) => item._id === e[0]
                                        )

                                        if (myContract) {
                                            let code = myContract.code.slice(
                                                2,
                                                5
                                            )
                                            const respectivePartner =
                                                partners?.find(
                                                    (item) => item.code === code
                                                )
                                            if (respectivePartner) {
                                                form.setFieldValue(
                                                    'buyer_id',
                                                    respectivePartner?._id
                                                )
                                                const filterData =
                                                    contracts.filter(
                                                        (i) =>
                                                            i?.partner_id
                                                                ?._id ===
                                                            respectivePartner?._id
                                                    )
                                                setFilteredContracts(filterData)
                                            }
                                        }
                                    }
                                }}
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={filteredContracts.map((i) => {
                                    return { value: i._id, label: i.code }
                                })}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="buyer_id"
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
                                prefix={
                                    <Space>
                                        <Button
                                            size="small"
                                            color="primary"
                                            variant="solid"
                                            onClick={() =>
                                                setOpenMyPartnerDrawer(true)
                                            }
                                        >
                                            <FaCirclePlus />
                                        </Button>
                                        <Button
                                            size="small"
                                            color="primary"
                                            variant="solid"
                                            onClick={() => {
                                                const value =
                                                    form.getFieldValue(
                                                        'buyer_id'
                                                    )
                                                const respectivePartner =
                                                    partners.find(
                                                        (item) =>
                                                            item._id === value
                                                    )
                                                if (respectivePartner) {
                                                    setOpenMyPartnerDrawer(
                                                        respectivePartner
                                                    )
                                                }
                                            }}
                                        >
                                            <MdModeEdit />
                                        </Button>
                                    </Space>
                                }
                                allowClear
                                onChange={(e) => {
                                    if (e) {
                                        const filtered = contracts.filter(
                                            (i) => i.partner_id?._id === e
                                        )
                                        setFilteredContracts(filtered)
                                    } else {
                                        setFilteredContracts(contracts)
                                    }
                                }}
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
                    </Col>

                    <Col span={8}>
                        <Form.Item name="contract_quantity" label="SL theo HĐ">
                            <InputNumber
                                onChange={calculateTotalStock}
                                inputMode="decimal"
                                style={{ width: '100%' }}
                                formatter={(value) =>
                                    value
                                        ? value
                                              .toString()
                                              .replace(
                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                  ','
                                              )
                                        : ''
                                }
                                parser={(value) =>
                                    value
                                        ? parseFloat(
                                              value.toString().replace(/,/g, '')
                                          )
                                        : 0
                                }
                                min={0}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="kho_tong" label="Kho Tổng">
                            <InputNumber
                                inputMode="decimal"
                                onChange={calculateTotalStock}
                                style={{ width: '100%' }}
                                formatter={(value) =>
                                    value
                                        ? value
                                              .toString()
                                              .replace(
                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                  ','
                                              )
                                        : ''
                                }
                                parser={(value) =>
                                    value
                                        ? parseFloat(
                                              value.toString().replace(/,/g, '')
                                          )
                                        : 0
                                }
                                min={0}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="theoritical_quantity"
                            label="SL cần thêm"
                        >
                            <InputNumber
                                disabled
                                inputMode="decimal"
                                readOnly
                                style={{ width: '100%' }}
                                formatter={(value) =>
                                    value
                                        ? value
                                              .toString()
                                              .replace(
                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                  ','
                                              )
                                        : ''
                                }
                                parser={(value) =>
                                    value
                                        ? parseFloat(
                                              value.toString().replace(/,/g, '')
                                          )
                                        : 0
                                }
                                min={0}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="loss_rate" label="Tỷ lệ hao hụt (%)">
                            <InputNumber
                                inputMode="decimal"
                                style={{ width: '100%' }}
                                onChange={calculateTotalStock}
                                formatter={(value) =>
                                    value
                                        ? value
                                              .toString()
                                              .replace(
                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                  ','
                                              )
                                        : ''
                                }
                                parser={(value) =>
                                    value
                                        ? parseFloat(
                                              value.toString().replace(/,/g, '')
                                          )
                                        : 0
                                }
                                min={0}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="quantity" label="SL cần mua" required>
                            <InputNumber
                                onChange={calculatePrice}
                                inputMode="decimal"
                                style={{ width: '100%' }}
                                formatter={(value) =>
                                    value
                                        ? value
                                              .toString()
                                              .replace(
                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                  ','
                                              )
                                        : ''
                                }
                                parser={(value) =>
                                    value
                                        ? parseFloat(
                                              value.toString().replace(/,/g, '')
                                          )
                                        : 0
                                }
                                min={0}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="price_unit"
                            required
                            label="Đơn giá (không thuế)"
                        >
                            <InputNumber
                                inputMode="decimal"
                                onChange={calculatePrice}
                                style={{ width: '100%' }}
                                formatter={(value) =>
                                    value
                                        ? value
                                              .toString()
                                              .replace(
                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                  ','
                                              )
                                        : ''
                                }
                                parser={(value) =>
                                    value
                                        ? parseFloat(
                                              value.toString().replace(/,/g, '')
                                          )
                                        : 0
                                }
                                min={0}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
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
                                              .replace(
                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                  ','
                                              )
                                        : ''
                                }
                                parser={(value) =>
                                    value
                                        ? parseFloat(
                                              value.toString().replace(/,/g, '')
                                          )
                                        : 0
                                }
                                min={0}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item name="quotation_date" label="Ngày báo giá">
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="standard"
                            label="Chất lượng tiêu chuẩn"
                        >
                            <Input className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="note" label="Ghi chú">
                            <Input className="w-full" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            {openMyProductDrawer && (
                <MyProductDrawer
                    open={openMyProductDrawer}
                    onClose={() => setOpenMyProductDrawer(false)}
                    getProducts={getProducts}
                />
            )}
            {openMyPartnerDrawer && (
                <MyPartnerDrawer
                    open={openMyPartnerDrawer}
                    onClose={() => setOpenMyPartnerDrawer(false)}
                    getPartners={getPartners}
                />
            )}
            {openMyContractDrawer && (
                <MyContractDrawer
                    open={openMyContractDrawer}
                    onClose={() => setOpenMyContractDrawer(false)}
                    getContracts={getContracts}
                />
            )}
            {openMyBrandDrawer && (
                <MyBrandDrawer
                    open={openMyBrandDrawer}
                    onClose={() => setOpenMyBrandDrawer(false)}
                    getBrands={getBrands}
                />
            )}
            {openMyBundleDrawer && (
                <MyBundleDrawer
                    open={openMyBundleDrawer}
                    onClose={() => setOpenMyBundleDrawer(false)}
                    getBundles={getBundles}
                />
            )}
            {openMyPackingDrawer && (
                <MyPackingDrawer
                    open={openMyPackingDrawer}
                    onClose={() => setOpenMyPackingDrawer(false)}
                    getPackings={getPackings}
                />
            )}
        </Modal>
    )
}

const MyContractDrawer = ({ open, onClose, getContracts }) => {
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

const MyProductDrawer = ({ open, onClose, getProducts }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const { uoms } = useZustand()

    const handleOk = async () => {
        try {
            const { name, code, quy_cach, standard, uom_id } =
                form.getFieldsValue()
            if (!name || !uom_id)
                return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-product/${open._id}`, {
                    name,
                    code,
                    quy_cach,
                    standard,
                    uom_id,
                })
            } else {
                await axios.post('/api/create-product', {
                    name,
                    code,
                    quy_cach,
                    standard,
                    uom_id,
                })
            }
            onClose()
            await getProducts()
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open?._id) {
            form.setFieldValue('name', open?.name)
            form.setFieldValue('code', open?.code)
            form.setFieldValue('quy_cach', open?.quy_cach)
            form.setFieldValue('standard', open?.standard)
            form.setFieldValue('uom_id', open?.uom_id?._id)
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
                    name="name"
                    label="Tên sản phẩm"
                    rules={[
                        { required: true, message: 'Hãy nhập tên sản phẩm!' },
                    ]}
                >
                    <Input
                        className="w-full"
                        placeholder="Thùng carton ABC..."
                    />
                </Form.Item>
                <Form.Item name="code" label="Mã sản phẩm">
                    <Input className="w-full" placeholder="KT4AW2..." />
                </Form.Item>
                <Form.Item
                    name="uom_id"
                    label="Đơn vị đo lường"
                    rules={[
                        {
                            required: true,
                            message: 'Hãy chọn đơn vị đo lường',
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
                        options={uoms.map((i) => {
                            return { value: i._id, label: i.name }
                        })}
                    />
                </Form.Item>
                <Form.Item name="quy_cach" label="Quy cách">
                    <Input className="w-full" placeholder="30x40x70..." />
                </Form.Item>
                <Form.Item name="standard" label="Chất lượng tiêu chuẩn">
                    <Input className="w-full" placeholder="30x40x70..." />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

const MyPartnerDrawer = ({ open, onClose, getPartners }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleOk = async () => {
        try {
            const {
                code,
                name,
                address,
                vat,
                short_name,
                district,
                country,
                replacedForContract,
                phone,
                fax,
                accountNumber,
                city,
                accountBank,
            } = form.getFieldsValue()
            if (!name) return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-partner/${open._id}`, {
                    code,
                    name,
                    address,
                    vat,
                    short_name,
                    district,
                    country,
                    phone,
                    replacedForContract,
                    fax,
                    accountNumber,
                    city,
                    accountBank,
                })
            } else {
                await axios.post('/api/create-partner', {
                    code,
                    name,
                    address,
                    vat,
                    district,
                    country,
                    phone,
                    short_name,
                    fax,
                    replacedForContract,
                    accountNumber,
                    city,
                    accountBank,
                })
            }
            onClose()
            await getPartners()
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open?._id) {
            form.setFieldValue('name', open?.name)
            form.setFieldValue('code', open?.code)
            form.setFieldValue('address', open?.address)
            form.setFieldValue('district', open?.district)
            form.setFieldValue('city', open?.city)
            form.setFieldValue('short_name', open?.short_name)
            form.setFieldValue('country', open?.country)
            form.setFieldValue('vat', open?.vat)
            form.setFieldValue('phone', open?.phone)
            form.setFieldValue('replacedForContract', open?.replacedForContract)
            form.setFieldValue('fax', open?.fax)
            form.setFieldValue('accountNumber', open?.accountNumber)
            form.setFieldValue('accountBank', open?.accountBank)
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
                    name="name"
                    label="Tên liên hệ"
                    rules={[
                        { required: true, message: 'Hãy nhập tên liên hệ!' },
                    ]}
                >
                    <Input className="w-full" placeholder="Công ty ABC..." />
                </Form.Item>
                <Form.Item name="short_name" label="Tên viết tắt">
                    <Input className="w-full" placeholder="TH..." />
                </Form.Item>
                <Form.Item name="code" label="Mã liên hệ">
                    <Input className="w-full" placeholder="KT4AW2..." />
                </Form.Item>
                <Space>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item name="district" label="Phường/Xã">
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item name="city" label="Thành phố">
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item name="country" label="Quốc gia">
                        <Input className="w-full" />
                    </Form.Item>
                </Space>
                <Space>
                    <Form.Item name="phone" label="Số điện thoại">
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item name="vat" label="Mã số thuế">
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item name="fax" label="Fax">
                        <Input className="w-full" />
                    </Form.Item>
                </Space>
                <Space>
                    <Form.Item name="accountNumber" label="Số tài khoản">
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item name="accountBank" label="Ngân hàng">
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item
                        name="replacedForContract"
                        label="Thay thế HĐ nguyên tắc"
                    >
                        <Input className="w-full" />
                    </Form.Item>
                </Space>
            </Form>
        </Drawer>
    )
}

const MyBrandDrawer = ({ open, onClose, getBrands }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleOk = async () => {
        try {
            const { name } = form.getFieldsValue()
            if (!name) return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-brand/${open._id}`, { name })
            } else {
                await axios.post('/api/create-brand', { name })
            }
            onClose()
            await getBrands()
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open?._id) {
            form.setFieldValue('name', open?.name)
        } else {
            form.resetFields()
        }
    }, [open])

    return (
        <Drawer
            title={open?._id ? 'Chỉnh sửa Brand' : 'Tạo mới Brand'}
            onClose={onClose}
            open={!!open}
            width={400}
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
                name="brandForm"
                onFinish={handleOk}
                layout="vertical"
            >
                <Form.Item
                    name="name"
                    label="Tên thương hiệu"
                    rules={[
                        {
                            required: true,
                            message: 'Hãy nhập tên thương hiệu!',
                        },
                    ]}
                >
                    <Input className="w-full" />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

const MyBundleDrawer = ({ open, onClose, getBundles }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleOk = async () => {
        try {
            const { name, quy_cach } = form.getFieldsValue()
            if (!name) return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-bundle/${open._id}`, {
                    name,
                    quy_cach,
                })
            } else {
                await axios.post('/api/create-bundle', { name, quy_cach })
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
                quy_cach: open?.quy_cach,
            })
        } else {
            form.resetFields()
        }
    }, [open])

    return (
        <Drawer
            title={open?._id ? 'Chỉnh sửa mặt hàng' : 'Tạo mới mặt hàng'}
            onClose={onClose}
            open={!!open}
            width={400}
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
                <Form.Item name="quy_cach" label="Quy cách">
                    <Input className="w-full" />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

const MyPackingDrawer = ({ open, onClose, getPackings }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleOk = async () => {
        try {
            const { name } = form.getFieldsValue()
            if (!name) return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-packing/${open._id}`, { name })
            } else {
                await axios.post('/api/create-packing', { name })
            }
            onClose()
            await getPackings()
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open?._id) {
            form.setFieldValue('name', open?.name)
        } else {
            form.resetFields()
        }
    }, [open])

    return (
        <Drawer
            title={open?._id ? 'Chỉnh sửa Packing' : 'Tạo mới Packing'}
            onClose={onClose}
            open={!!open}
            width={400}
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
                name="brandForm"
                onFinish={handleOk}
                layout="vertical"
            >
                <Form.Item
                    name="name"
                    label="Tên packing"
                    rules={[
                        {
                            required: true,
                            message: 'Hãy nhập tên packing!',
                        },
                    ]}
                >
                    <Input className="w-full" />
                </Form.Item>
            </Form>
        </Drawer>
    )
}
