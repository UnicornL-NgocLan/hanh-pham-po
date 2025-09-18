import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import Stapimex from '../stapimex.png'
import moment from 'moment'

export const exportPurchaseRequestToExcel = async (pr, data) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('DN')

    worksheet.getColumn(15).pageBreak = true

    worksheet.pageSetup = {
        fitToWidth: 1, // fit all columns in one page width
        fitToHeight: 0, // 0 means as many pages as needed for rows
        orientation: 'landscape',
        fitToPage: true,
    }

    worksheet.getRow(1).height = 30
    worksheet.getRow(2).height = 30
    worksheet.getRow(3).height = 30
    worksheet.getRow(4).height = 30
    worksheet.getRow(5).height = 30
    worksheet.getRow(6).height = 30
    worksheet.getRow(7).height = 30
    worksheet.getRow(9).height = 50
    worksheet.getRow(10).height = 30

    worksheet.getColumn(1).width = 5
    worksheet.getColumn(2).width = 25
    worksheet.getColumn(3).width = 10
    worksheet.getColumn(4).width = 15
    worksheet.getColumn(5).width = 15
    worksheet.getColumn(6).width = 12
    worksheet.getColumn(7).width = 9
    worksheet.getColumn(11).width = 18
    worksheet.getColumn(13).width = 20
    worksheet.getColumn(14).width = 12

    // Set value at L1
    worksheet.getCell('L1').value = 'BM 08/QTPB-KD-03'
    // Apply font style
    worksheet.getCell('L1').font = {
        name: 'Times New Roman',
        size: 10,
    }

    // Set value at L2
    worksheet.getCell('L2').value = 'TC: 01'
    // Apply font style
    worksheet.getCell('L2').font = {
        name: 'Times New Roman',
        size: 10,
    }

    // Set value at C4:N4
    worksheet.mergeCells('A4:N4')
    worksheet.getCell('A4').value = 'BẢNG ĐỀ NGHỊ MUA BAO BÌ/ VẬT TƯ'
    // Apply font style
    worksheet.getCell('A4').font = {
        name: 'Times New Roman',
        size: 19,
    }
    worksheet.getCell('A4').alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }
    // Fetch the image and convert to ArrayBuffer
    const response = await fetch(Stapimex)
    const imageBlob = await response.blob()
    const arrayBuffer = await imageBlob.arrayBuffer()

    // Add image to workbook
    const imageId = workbook.addImage({
        buffer: arrayBuffer,
        extension: 'png',
    })

    // Place image at A1
    worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 }, // top-left corner at column A (0), row 1 (0)
        ext: { width: 143, height: 127 }, // size in pixels
    })

    worksheet.mergeCells('A5:N5')
    worksheet.getCell('A5').value = 'Bộ phận: Phòng Kinh Doanh'
    // Apply font style
    worksheet.getCell('A5').font = {
        name: 'Times New Roman',
        size: 15,
    }
    worksheet.getCell('A5').alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.mergeCells('A6:N6')
    worksheet.getCell('A6').value = `Số đề nghị ${pr.name}`
    // Apply font style
    worksheet.getCell('A6').font = {
        name: 'Times New Roman',
        size: 15,
    }
    worksheet.getCell('A6').alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.mergeCells('B7:N7')
    worksheet.getCell(
        'B7'
    ).value = `'- Căn cứ vào Quy trình Triển khai đặt và in ấn bao bì (MS: QTTKIABB)`
    // Apply font style
    worksheet.getCell('B7').font = {
        name: 'Times New Roman',
        size: 13,
    }
    worksheet.getCell('B7').alignment = {
        vertical: 'middle',
    }

    worksheet.mergeCells('A8:A9')
    worksheet.getCell('A8').value = `STT`
    // Apply font style
    worksheet.getCell('A8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('A8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.mergeCells('B8:B9')
    worksheet.getCell('B8').value = `TÊN VẬT TƯ`
    // Apply font style
    worksheet.getCell('B8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('B8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.mergeCells('C8:C9')
    worksheet.getCell('C8').value = `ĐVT`
    // Apply font style
    worksheet.getCell('C8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('C8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.mergeCells('D8:D9')
    worksheet.getCell('D8').value = `QUY CÁCH 
(CM)`
    // Apply font style
    worksheet.getCell('D8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('D8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.mergeCells('E8:E9')
    worksheet.getCell('E8').value = `SỬ DỤNG CHO KHÁCH HÀNG/ HỢP ĐỒNG`
    // Apply font style
    worksheet.getCell('E8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('E8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.mergeCells('F8:F9')
    worksheet.getCell('F8').value = `SỐ LƯỢNG THEO HỢP ĐỒNG`
    // Apply font style
    worksheet.getCell('F8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('F8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.mergeCells('G8:J8')
    worksheet.getCell('G8').value = `Tồn đầu kỳ`
    // Apply font style
    worksheet.getCell('G8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('G8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('G9').value = `KHO TỔNG`
    // Apply font style
    worksheet.getCell('G9').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('G9').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('H9').value = `TÂN LONG`
    // Apply font style
    worksheet.getCell('H9').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('H9').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('I9').value = `AN PHÚ`
    // Apply font style
    worksheet.getCell('I9').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('I9').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('J9').value = `TỔNG TỒN`
    // Apply font style
    worksheet.getCell('J9').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('J9').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.mergeCells('K8:K9')
    worksheet.getCell('K8').value = `SỐ LƯỢNG CẦN THÊM`
    // Apply font style
    worksheet.getCell('K8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('K8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.mergeCells('L8:L9')
    worksheet.getCell('L8').value = `TỶ LỆ HAO HỤT (%)`
    // Apply font style
    worksheet.getCell('L8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('L8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.mergeCells('M8:M9')
    worksheet.getCell('M8').value = `SỐ LƯỢNG THỰC TẾ CẦN MUA`
    // Apply font style
    worksheet.getCell('M8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('M8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.mergeCells('N8:N9')
    worksheet.getCell('N8').value = `GHI CHÚ`
    // Apply font style
    worksheet.getCell('N8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('N8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('A10').value = `(1)`
    // Apply font style
    worksheet.getCell('A10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('A10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('B10').value = `(2)`
    // Apply font style
    worksheet.getCell('B10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('B10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('C10').value = `(3)`
    // Apply font style
    worksheet.getCell('C10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('C10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('D10').value = `(4)`
    // Apply font style
    worksheet.getCell('D10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('D10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('E10').value = `(5)`
    // Apply font style
    worksheet.getCell('E10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('E10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('F10').value = `(6)`
    // Apply font style
    worksheet.getCell('F10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('F10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('G10').value = `(7)`
    // Apply font style
    worksheet.getCell('G10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('G10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('H10').value = `(8)`
    // Apply font style
    worksheet.getCell('H10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('H10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('I10').value = `(9)`
    // Apply font style
    worksheet.getCell('I10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('I10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('J10').value = `(10)=(7)+(8)+(9)`
    // Apply font style
    worksheet.getCell('J10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('J10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('K10').value = `(11)=(6)-(10)`
    // Apply font style
    worksheet.getCell('K10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('K10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('L10').value = `(12)`
    // Apply font style
    worksheet.getCell('L10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('L10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('M10').value = `(13)=(11)+(12)`
    // Apply font style
    worksheet.getCell('M10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('M10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('N10').value = `(14)`
    // Apply font style
    worksheet.getCell('N10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('N10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    const listOfColumn = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
    ]

    for (let i = 0; i < data.length; i++) {
        let rowNum = 10 + i + 1
        for (let j = 0; j < listOfColumn.length; j++) {
            let cellValue
            switch (listOfColumn[j]) {
                case 'A':
                    cellValue = i + 1
                    break
                case 'B':
                    cellValue = data[i]?.product_id?.name
                    break
                case 'C':
                    cellValue = data[i]?.uom_id?.name
                    break
                case 'D':
                    cellValue = data[i]?.quy_cach
                    break
                case 'E':
                    let contractString = ''
                    const contractList = data[i]?.contract_id
                    for (let k = 0; k < contractList.length; k++) {
                        if (k === contractList.length - 1) {
                            contractString =
                                contractString + contractList[k]?.code
                        } else {
                            contractString =
                                contractString + contractList[k]?.code + ', '
                        }
                    }
                    cellValue = `${data[i]?.buyer_id?.name} - ${contractString}`
                    break
                case 'F':
                    cellValue = data[i].contract_quantity
                    break
                case 'G':
                    cellValue = data[i].kho_tong
                    break
                case 'H':
                    cellValue = 0
                    break
                case 'I':
                    cellValue = 0
                    break
                case 'J':
                    cellValue = data[i].kho_tong
                    break
                case 'K':
                    cellValue = data[i].contract_quantity - data[i].kho_tong
                    break
                case 'L':
                    cellValue =
                        data[i].quantity -
                        (data[i].contract_quantity - data[i].kho_tong)
                    break
                case 'M':
                    cellValue = data[i].quantity
                    break
                case 'N':
                    cellValue = data[i].note
                    break
                default:
                    cellValue = ''
            }
            worksheet.getCell(`${listOfColumn[j]}${rowNum}`).value = cellValue
            // Apply font style
            worksheet.getCell(`${listOfColumn[j]}${rowNum}`).font = {
                name: 'Times New Roman',
                size: 11,
            }
            worksheet.getCell(`${listOfColumn[j]}${rowNum}`).alignment = {
                vertical: 'middle',
                wrapText: true,
                horizontal: listOfColumn[j] === 'A' ? 'center' : undefined,
            }
        }
    }

    let endNumRow = 10 + data.length

    for (let row = 8; row <= endNumRow; row++) {
        for (let col = 1; col <= 14; col++) {
            const cell = worksheet.getRow(row).getCell(col)
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            }
        }
    }

    worksheet.getCell(`L${endNumRow + 1}`).value = `Ngày`
    // Apply font style
    worksheet.getCell(`L${endNumRow + 1}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`L${endNumRow + 1}`).alignment = {
        vertical: 'middle',
        horizontal: 'center',
    }

    worksheet.getCell(`M${endNumRow + 1}`).value = moment(pr.date).format(
        'DD/MM/YYYY'
    )
    // Apply font style
    worksheet.getCell(`M${endNumRow + 1}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`M${endNumRow + 1}`).alignment = {
        vertical: 'middle',
    }

    worksheet.getCell(`B${endNumRow + 2}`).value = `Ban Tổng Giám Đốc`
    // Apply font style
    worksheet.getCell(`B${endNumRow + 2}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`B${endNumRow + 2}`).alignment = {
        vertical: 'middle',
    }

    worksheet.getCell(`F${endNumRow + 2}`).value = `Phòng kinh doanh`
    // Apply font style
    worksheet.getCell(`F${endNumRow + 2}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`F${endNumRow + 2}`).alignment = {
        vertical: 'middle',
    }

    worksheet.mergeCells(`L${endNumRow + 2}:M${endNumRow + 2}`)
    worksheet.getCell(
        `L${endNumRow + 2}:M${endNumRow + 2}`
    ).value = `Người đề nghị`
    // Apply font style
    worksheet.getCell(`L${endNumRow + 2}:M${endNumRow + 2}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`L${endNumRow + 2}:M${endNumRow + 2}`).alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.mergeCells(`F${endNumRow + 10}:G${endNumRow + 10}`)
    worksheet.getCell(
        `F${endNumRow + 10}:G${endNumRow + 10}`
    ).value = `Nguyễn Văn Khoa`
    // Apply font style
    worksheet.getCell(`F${endNumRow + 10}:G${endNumRow + 10}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`F${endNumRow + 10}:G${endNumRow + 10}`).alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.mergeCells(`L${endNumRow + 10}:M${endNumRow + 10}`)
    worksheet.getCell(
        `L${endNumRow + 10}:M${endNumRow + 10}`
    ).value = `Phạm Thị Xuân Hạnh`
    // Apply font style
    worksheet.getCell(`L${endNumRow + 10}:M${endNumRow + 10}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`L${endNumRow + 10}:M${endNumRow + 10}`).alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.getCell(
        `B${endNumRow + 12}`
    ).value = `(2), (3), (4), (5), (6): Thông tin được lấy từ hợp đồng, file thiết kế bao bì`
    // Apply font style
    worksheet.getCell(`B${endNumRow + 12}`).font = {
        name: 'Times New Roman',
        size: 13,
    }
    worksheet.getCell(`B${endNumRow + 12}`).alignment = {
        vertical: 'middle',
    }

    worksheet.getCell(
        `B${endNumRow + 13}`
    ).value = `(7), (8), (9): Số liệu tồn kho do các kho bao bì (Kho Bao bì Tổng, Kho Bao Bì Tân Long, Kho Bao bì An Phú) cung cấp`
    // Apply font style
    worksheet.getCell(`B${endNumRow + 13}`).font = {
        name: 'Times New Roman',
        size: 13,
    }
    worksheet.getCell(`B${endNumRow + 13}`).alignment = {
        vertical: 'middle',
    }

    worksheet.getCell(
        `B${endNumRow + 14}`
    ).value = `(12): căn cứ vào quy định về tỷ lệ đặt hao hụt trong Quy trình Triển khai đặt và in ấn bao bì (mục 3.1.2 trang 4)`
    // Apply font style
    worksheet.getCell(`B${endNumRow + 14}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`B${endNumRow + 14}`).alignment = {
        vertical: 'middle',
    }

    // Generate and save the Excel file
    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), 'DN.xlsx')
}

export const exportPurchaseOrderToExcel = async (po, data) => {
    try {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('DN')

        worksheet.getColumn(13).pageBreak = true

        worksheet.pageSetup = {
            fitToWidth: 1, // fit all columns in one page width
            fitToHeight: 0, // 0 means as many pages as needed for rows
            orientation: 'portrait',
            fitToPage: true,
        }
        worksheet.getColumn(3).width = 20
        worksheet.getColumn(6).width = 10
        worksheet.getColumn(7).width = 16
        worksheet.getColumn(11).width = 12
        worksheet.getColumn(13).width = 20

        worksheet.mergeCells('C1:M1')
        worksheet.getCell('C1').value = 'ĐƠN ĐẶT HÀNG'
        // Apply font style
        worksheet.getCell('C1').font = {
            name: 'Times New Roman',
            size: 26,
        }
        worksheet.getCell('C1').alignment = {
            horizontal: 'center',
            vertical: 'middle',
        }
        // Fetch the image and convert to ArrayBuffer
        const response = await fetch(Stapimex)
        const imageBlob = await response.blob()
        const arrayBuffer = await imageBlob.arrayBuffer()

        // Add image to workbook
        const imageId = workbook.addImage({
            buffer: arrayBuffer,
            extension: 'png',
        })

        // Place image at A1
        worksheet.addImage(imageId, {
            tl: { col: 0, row: 0 }, // top-left corner at column A (0), row 1 (0)
            ext: { width: 186, height: 165 }, // size in pixels
        })

        worksheet.mergeCells('C2:M2')
        worksheet.getCell(
            'C2'
        ).value = `(Thay cho phụ kiện của Hợp đồng nguyên tắc số: ${po?.replacedForContract})`
        // Apply font style
        worksheet.getCell('C2').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('C2').alignment = {
            horizontal: 'center',
            vertical: 'middle',
        }

        worksheet.mergeCells('C3:M3')
        worksheet.getCell('C3').value = `(BM 07/QTPB-KD-03)`
        // Apply font style
        worksheet.getCell('C3').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('C3').alignment = {
            horizontal: 'center',
            vertical: 'middle',
        }

        worksheet.getCell('G5').value = `Số: ${po.name}`
        // Apply font style
        worksheet.getCell('G5').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('G5').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('G6').value = `Ngày đặt hàng: ${moment(
            po.date_ordered
        )
            .add(7, 'hour')
            .format('DD/MM/YYYY')}`
        // Apply font style
        worksheet.getCell('G6').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('G6').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell(
            'A7'
        ).value = `Căn cứ vào bảng đề nghị mua vật tư: Số đề nghị ${po?.pr_name} của Phòng Kinh Doanh`
        // Apply font style
        worksheet.getCell('A7').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('A7').alignment = {
            vertical: 'middle',
        }

        let dateString = ''

        let dateList = [
            ...new Set(
                data
                    .filter((item) => item.quotation_date)
                    .sort((a, b) => b.quotation_date - a.quotation_date)
                    .map((item) => item.quotation_date)
            ),
        ].sort()
        for (let k = 0; k < dateList.length; k++) {
            if (k === dateList.length - 1) {
                dateString =
                    dateString +
                    moment(dateList[k])
                        .add(7, 'hours')
                        .format('DD/MM/YYYY')
                        .toString()
            } else {
                dateString =
                    dateString +
                    moment(dateList[k])
                        .add(7, 'hours')
                        .format('DD/MM/YYYY')
                        .toString() +
                    ', '
            }
        }
        worksheet.getCell(
            'A8'
        ).value = `Căn cứ vào bảng báo giá ngày ${dateString} của ${po?.partner_id?.name}`
        // Apply font style
        worksheet.getCell('A8').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('A8').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('A9').value = {
            richText: [
                {
                    text: 'BÊN MUA: ',
                    font: {
                        bold: true,
                        name: 'Times New Roman',
                        size: 15,
                        underline: true,
                    },
                },
                {
                    text: po?.customer_id?.name,
                    font: { name: 'Times New Roman', size: 15 },
                },
            ],
        }
        worksheet.getCell('A9').alignment = {
            vertical: 'middle',
        }
        worksheet.mergeCells('H9:M9')
        worksheet.getCell('H9').value = {
            richText: [
                {
                    text: 'BÊN BÁN: ',
                    font: {
                        bold: true,
                        name: 'Times New Roman',
                        size: 15,
                        underline: true,
                    },
                },
                {
                    text: po?.partner_id?.name,
                    font: { name: 'Times New Roman', size: 15 },
                },
            ],
        }

        worksheet.getCell('H9').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('A10').value = `Địa chỉ: ${
            po?.customer_id?.address || ''
        }, ${po?.customer_id?.district || ''}`
        // Apply font style
        worksheet.getCell('A10').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('A10').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('H10').value = `Địa chỉ: ${
            po?.partner_id?.address || ''
        },`
        // Apply font style
        worksheet.getCell('H10').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('H10').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('A11').value = `${po?.customer_id?.city || ''}, ${
            po?.customer_id?.country || ''
        }`
        // Apply font style
        worksheet.getCell('A11').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('A11').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('H11').value = `${po?.partner_id?.district || ''}, ${
            po?.partner_id?.city || ''
        }, ${po?.partner_id?.country || ''}`
        // Apply font style
        worksheet.getCell('H11').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('H11').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('A12').value = `Mã số thuế: ${
            po?.customer_id?.vat || ''
        }`
        // Apply font style
        worksheet.getCell('A12').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('A12').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('H12').value = `Mã số thuế: ${
            po?.partner_id?.vat || ''
        }`
        // Apply font style
        worksheet.getCell('H12').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('H12').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('A13').value = `Điện thoại: ${
            po?.customer_id?.phone || ''
        }`
        // Apply font style
        worksheet.getCell('A13').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('A13').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('H13').value = `Điện thoại: ${
            po?.partner_id?.phone || ''
        }`
        // Apply font style
        worksheet.getCell('H13').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('H13').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('A14').value = `Fax: ${po?.customer_id?.fax || ''}`
        // Apply font style
        worksheet.getCell('A14').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('A14').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('H14').value = `Fax: ${po?.partner_id?.fax || ''}`
        // Apply font style
        worksheet.getCell('H14').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('H14').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('A15').value = `Tài khoản: ${
            po?.customer_id?.accountNumber || ''
        }`
        // Apply font style
        worksheet.getCell('A15').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('A15').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('H15').value = `Tài khoản: ${
            po?.partner_id?.accountNumber || ''
        }`
        // Apply font style
        worksheet.getCell('H15').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('H15').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('A16').value = {
            richText: [
                {
                    text: 'Tại: ',
                    font: {
                        name: 'Times New Roman',
                        size: 18,
                    },
                },
                {
                    text: po?.customer_id?.accountBank || '',
                    font: { name: 'Times New Roman', size: 16 },
                },
            ],
        }
        // Apply font style
        worksheet.getCell('A16').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('A16').alignment = {
            vertical: 'middle',
        }

        worksheet.getCell('H16').value = {
            richText: [
                {
                    text: 'Tại: ',
                    font: {
                        name: 'Times New Roman',
                        size: 18,
                    },
                },
                {
                    text: po?.partner_id?.accountBank || '',
                    font: { name: 'Times New Roman', size: 16 },
                },
            ],
        }
        // Apply font style
        worksheet.getCell('H16').font = {
            name: 'Times New Roman',
            size: 17,
        }
        worksheet.getCell('H16').alignment = {
            vertical: 'middle',
        }

        for (let row = 9; row <= 16; row++) {
            const cell = worksheet.getRow(row).getCell(1)
            cell.border = {
                left: { style: 'thin' },
            }
        }

        for (let row = 9; row <= 16; row++) {
            const cell = worksheet.getRow(row).getCell(13)
            cell.border = {
                right: { style: 'thin' },
            }
        }

        worksheet.getCell('A9').border = {
            left: { style: 'thin' },
            top: { style: 'thin' },
        }

        worksheet.getCell('A16').border = {
            left: { style: 'thin' },
            bottom: { style: 'thin' },
        }

        worksheet.getCell('H9').border = {
            right: { style: 'thin' },
            top: { style: 'thin' },
        }

        worksheet.getCell('M16').border = {
            right: { style: 'thin' },
            bottom: { style: 'thin' },
        }

        worksheet.getCell('G9').border = {
            top: { style: 'thin' },
            right: { style: 'thin' },
        }

        worksheet.getCell('G16').border = {
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        }

        for (let row = 10; row <= 15; row++) {
            const cell = worksheet.getRow(row).getCell(7)
            cell.border = {
                right: { style: 'thin' },
            }
        }

        for (let row = 10; row <= 15; row++) {
            const cell = worksheet.getRow(row).getCell(7)
            cell.border = {
                right: { style: 'thin' },
            }
        }

        for (let col = 2; col <= 6; col++) {
            const cell = worksheet.getRow(9).getCell(col)
            cell.border = {
                top: { style: 'thin' },
            }
        }

        for (let col = 2; col <= 6; col++) {
            const cell = worksheet.getRow(16).getCell(col)
            cell.border = {
                bottom: { style: 'thin' },
            }
        }

        for (let col = 8; col <= 12; col++) {
            const cell = worksheet.getRow(16).getCell(col)
            cell.border = {
                bottom: { style: 'thin' },
            }
        }

        worksheet.getCell('A18').value = `Số TT`
        // Apply font style
        worksheet.getCell('A18').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('A18').alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }

        worksheet.mergeCells('B18:D18')
        worksheet.getCell('B18').value = `Tên vật tư bao bì`
        // Apply font style
        worksheet.getCell('B18').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('B18').alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }

        worksheet.mergeCells('E18:F18')
        worksheet.getCell('E18').value = `ĐVT`
        // Apply font style
        worksheet.getCell('E18').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('E18').alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }

        worksheet.mergeCells('G18:I18')
        worksheet.getCell('G18').value = `Chất lượng tiêu chuẩn`
        // Apply font style
        worksheet.getCell('G18').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('G18').alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }

        worksheet.getCell('J18').value = `Quy cách (cm)`
        // Apply font style
        worksheet.getCell('J18').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('J18').alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }

        worksheet.getCell('K18').value = `Số lượng`
        // Apply font style
        worksheet.getCell('K18').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('K18').alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }

        worksheet.getCell('L18').value = `Đơn giá VNĐ (chưa thuế)`
        // Apply font style
        worksheet.getCell('L18').font = {
            name: 'Times New Roman',
            size: 16,
        }
        worksheet.getCell('L18').alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }

        worksheet.getCell('M18').value = `Thành tiền (VNĐ)`
        // Apply font style
        worksheet.getCell('M18').font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell('M18').alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }

        worksheet.getRow(18).height = 60
        worksheet.getColumn(1).width = 5
        worksheet.getColumn(2).width = 26
        worksheet.getColumn(5).width = 5
        worksheet.getColumn(8).width = 5
        worksheet.getColumn(9).width = 5
        worksheet.getColumn(10).width = 22
        worksheet.getColumn(12).width = 18

        const listOfColumn = ['A', 'B', 'E', 'G', 'J', 'K', 'L', 'M']
        for (let i = 0; i < data.length; i++) {
            let rowNum = 19 + i
            for (let j = 0; j < listOfColumn.length; j++) {
                let cellValue = ''
                switch (listOfColumn[j]) {
                    case 'A':
                        cellValue = i + 1
                        break
                    case 'B':
                        worksheet.mergeCells(`B${rowNum}:D${rowNum}`)
                        cellValue = data[i]?.product_id?.name
                        break
                    case 'E':
                        worksheet.mergeCells(`E${rowNum}:F${rowNum}`)
                        cellValue = data[i]?.uom_id?.name
                        break
                    case 'G':
                        worksheet.mergeCells(`G${rowNum}:I${rowNum}`)
                        cellValue = data[i]?.standard
                        break
                    case 'J':
                        cellValue = data[i]?.quy_cach
                        break
                    case 'K':
                        worksheet.getCell(
                            `${listOfColumn[j]}${rowNum}`
                        ).numFmt = '#,##0'
                        cellValue = data[i].quantity || 0
                        break
                    case 'L':
                        worksheet.getCell(
                            `${listOfColumn[j]}${rowNum}`
                        ).numFmt = '#,##0'
                        cellValue = data[i].price_unit || 0
                        break
                    case 'M':
                        worksheet.getCell(
                            `${listOfColumn[j]}${rowNum}`
                        ).numFmt = '#,##0'
                        cellValue = data[i].quantity * data[i].price_unit || 0
                        break
                    default:
                        cellValue = ''
                }
                worksheet.getCell(`${listOfColumn[j]}${rowNum}`).value =
                    cellValue === undefined ? '' : cellValue
                // Apply font style
                worksheet.getCell(`${listOfColumn[j]}${rowNum}`).font = {
                    name: 'Times New Roman',
                    size: ['B', 'G'].includes(listOfColumn[j]) ? 17 : 18,
                }
                worksheet.getRow(rowNum).height = 75
                worksheet.getCell(`${listOfColumn[j]}${rowNum}`).alignment = {
                    vertical: 'middle',
                    wrapText: true,
                    horizontal: ['A', 'E', 'G', 'J'].includes(listOfColumn[j])
                        ? 'center'
                        : undefined,
                }
            }
        }

        let endNumRow = 18 + data.length

        worksheet.mergeCells(`A${endNumRow + 1}:L${endNumRow + 1}`)
        worksheet.getCell(
            `A${endNumRow + 1}`
        ).value = `Thành tiền (Chưa bao gồm thuế GTGT)`
        // Apply font style
        worksheet.getCell(`A${endNumRow + 1}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`A${endNumRow + 1}`).alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }
        worksheet.mergeCells(`A${endNumRow + 2}:L${endNumRow + 2}`)
        worksheet.getCell(`A${endNumRow + 2}`).value = `Thuế GTGT 8%`
        // Apply font style
        worksheet.getCell(`A${endNumRow + 2}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`A${endNumRow + 2}`).alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }
        worksheet.mergeCells(`A${endNumRow + 3}:L${endNumRow + 3}`)
        worksheet.getCell(`A${endNumRow + 3}`).value = `Tổng cộng`
        // Apply font style
        worksheet.getCell(`A${endNumRow + 3}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`A${endNumRow + 3}`).alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }

        worksheet.getCell(`M${endNumRow + 1}`).value = po.amount_untaxed
        // Apply font style
        worksheet.getCell(`M${endNumRow + 1}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`M${endNumRow + 1}`).alignment = {
            vertical: 'middle',
            wrapText: true,
        }
        worksheet.getCell(`M${endNumRow + 1}`).numFmt = '#,##0'
        worksheet.getRow(endNumRow + 1).height = 40

        worksheet.getCell(`M${endNumRow + 2}`).value = po.tax
        // Apply font style
        worksheet.getCell(`M${endNumRow + 2}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`M${endNumRow + 2}`).alignment = {
            vertical: 'middle',
            wrapText: true,
        }
        worksheet.getCell(`M${endNumRow + 2}`).numFmt = '#,##0'
        worksheet.getRow(endNumRow + 2).height = 40

        worksheet.getCell(`M${endNumRow + 3}`).value = po.total_amount
        // Apply font style
        worksheet.getCell(`M${endNumRow + 3}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`M${endNumRow + 3}`).alignment = {
            vertical: 'middle',
            wrapText: true,
        }
        worksheet.getCell(`M${endNumRow + 3}`).numFmt = '#,##0'
        worksheet.getRow(endNumRow + 3).height = 40

        for (let row = 18; row <= endNumRow + 3; row++) {
            for (let col = 1; col <= 13; col++) {
                const cell = worksheet.getRow(row).getCell(col)
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                }
            }
        }

        worksheet.getCell(`A${endNumRow + 4}`).value = '1.'
        // Apply font style
        worksheet.getCell(`A${endNumRow + 4}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`A${endNumRow + 4}`).alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }

        worksheet.getCell(`B${endNumRow + 4}`).value = 'Ngày giao hàng:'
        // Apply font style
        worksheet.getCell(`B${endNumRow + 4}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`B${endNumRow + 4}`).alignment = {
            vertical: 'middle',
        }

        worksheet.getCell(`C${endNumRow + 4}`).value = po.date_deliveried
            ? `${moment(po.date_deliveried)
                  .add(7, 'hour')
                  .format('DD/MM/YYYY')}`
            : 'thông báo sau'
        // Apply font style
        worksheet.getCell(`C${endNumRow + 4}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`C${endNumRow + 4}`).alignment = {
            vertical: 'middle',
        }

        worksheet.getCell(
            `D${endNumRow + 4}`
        ).value = `Địa điểm giao nhận: Kho bên mua`
        // Apply font style
        worksheet.getCell(`D${endNumRow + 4}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`D${endNumRow + 4}`).alignment = {
            vertical: 'middle',
        }

        worksheet.getCell(`A${endNumRow + 5}`).value = '2.'
        // Apply font style
        worksheet.getCell(`A${endNumRow + 5}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`A${endNumRow + 5}`).alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }

        worksheet.getCell(
            `B${endNumRow + 5}`
        ).value = `Chi phí bốc xếp: Mỗi bên chịu một đầu`
        // Apply font style
        worksheet.getCell(`B${endNumRow + 5}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`B${endNumRow + 5}`).alignment = {
            vertical: 'middle',
        }

        worksheet.getCell(`A${endNumRow + 6}`).value = '3.'
        // Apply font style
        worksheet.getCell(`A${endNumRow + 6}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`A${endNumRow + 6}`).alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }

        worksheet.getCell(
            `B${endNumRow + 6}`
        ).value = `Chi phí vận chuyển: Bên bán chịu`
        // Apply font style
        worksheet.getCell(`B${endNumRow + 6}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`B${endNumRow + 6}`).alignment = {
            vertical: 'middle',
        }

        worksheet.getCell(`A${endNumRow + 7}`).value = '4.'
        // Apply font style
        worksheet.getCell(`A${endNumRow + 7}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`A${endNumRow + 7}`).alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        }

        worksheet.getCell(
            `B${endNumRow + 7}`
        ).value = `Hình thức và thời hạn thanh toán: Căn cứ theo Hợp Đồng Nguyên Tắc đã ký`
        // Apply font style
        worksheet.getCell(`B${endNumRow + 7}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`B${endNumRow + 7}`).alignment = {
            vertical: 'middle',
        }

        worksheet.getCell(`A${endNumRow + 8}`).value = '5.'
        // Apply font style
        worksheet.getCell(`A${endNumRow + 8}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`A${endNumRow + 8}`).alignment = {
            vertical: 'top',
            wrapText: true,
            horizontal: 'center',
        }

        worksheet.mergeCells(`B${endNumRow + 8}:M${endNumRow + 8}`)
        worksheet.getCell(`B${endNumRow + 8}`).value =
            'Khi giao hàng thì bên bán phải đóng gói thành kiện theo từng qui cách, chủng loại với số lượng từng kiện phải giống nhau và phải ghi rõ trọng lượng của từng kiện hàng. Nếu có số lượng lẻ sẽ được giao trong đợt giao hàng cuối cùng. Bên bán phải thông báo cho người mua hàng và thủ kho ít nhất 1 ngày trước khi giao hàng để bên mua bố trí người sắp xếp kho bãi nhận hàng. Khi giao hàng bên bán phải gửi phiếu giao nhận hàng hóa cùng kiện hàng cho thủ kho Xí nghiệp An Phú. Phiếu giao nhận hàng hóa phải có ký, ghi họ tên bên giao, ghi đầy đủ tên hàng hóa,quy cách số lượng thực tế hàng được giao và kèm theo số đơn đặt hàng. Nếu số lượng giao không khớp đúng với hóa đơn, phiếu giao hàng thì bên mua được quyền không thanh toán cho bên bán hóa đơn này.'
        // Apply font style
        worksheet.getCell(`B${endNumRow + 8}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`B${endNumRow + 8}`).alignment = {
            vertical: 'top',
            wrapText: true,
        }

        worksheet.getRow(endNumRow + 8).height = 190

        worksheet.getCell(`A${endNumRow + 9}`).value = '6.'
        // Apply font style
        worksheet.getCell(`A${endNumRow + 9}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`A${endNumRow + 9}`).alignment = {
            wrapText: true,
            vertical: 'top',
            horizontal: 'center',
        }

        worksheet.mergeCells(`B${endNumRow + 9}:M${endNumRow + 9}`)
        worksheet.getCell(`B${endNumRow + 9}`).value =
            'Ðiều khoản chung: Hai bên cam kết rằng sẽ giao hàng và nhận hàng đúng số lượng, chất lượng, quy cách, tiêu chuẩn và thời hạn giao - nhận. Nếu bên nào đơn phương hủy bỏ đơn đặt hàng thì phải bồi thường thiệt hại cho bên kia theo giá thời điểm. '
        // Apply font style
        worksheet.getCell(`B${endNumRow + 9}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`B${endNumRow + 9}`).alignment = {
            wrapText: true,
            vertical: 'top',
        }

        worksheet.getRow(endNumRow + 9).height = 60

        worksheet.getCell(`A${endNumRow + 10}`).value = '7.'
        // Apply font style
        worksheet.getCell(`A${endNumRow + 10}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`A${endNumRow + 10}`).alignment = {
            wrapText: true,
            vertical: 'top',
            horizontal: 'center',
        }

        worksheet.mergeCells(`B${endNumRow + 10}:M${endNumRow + 10}`)
        worksheet.getCell(`B${endNumRow + 10}`).value =
            'Nếu có thay đổi về thời gian giao hàng thì nhân viên mua hàng sẽ thông báo bằng email cho bên bán. Trường hợp vi phạm hợp đồng  (nếu có) tiền phạt sẽ thanh toán bù trừ công nợ'
        // Apply font style
        worksheet.getCell(`B${endNumRow + 10}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`B${endNumRow + 10}`).alignment = {
            wrapText: true,
            vertical: 'top',
        }

        worksheet.getRow(endNumRow + 10).height = 60

        worksheet.getCell(`A${endNumRow + 11}`).value = '8.'
        // Apply font style
        worksheet.getCell(`A${endNumRow + 11}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`A${endNumRow + 11}`).alignment = {
            wrapText: true,
            horizontal: 'center',
        }

        worksheet.mergeCells(`B${endNumRow + 11}:M${endNumRow + 11}`)
        worksheet.getCell(`B${endNumRow + 11}`).value =
            'Ðơn đặt hàng có giá trị qua Fax và được xác nhận bằng chữ ký có thẩm quyền của hai bên.'
        // Apply font style
        worksheet.getCell(`B${endNumRow + 11}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`B${endNumRow + 11}`).alignment = {
            wrapText: true,
        }

        worksheet.mergeCells(`B${endNumRow + 12}:E${endNumRow + 12}`)
        worksheet.getCell(`B${endNumRow + 12}`).value = 'ĐẠI DIỆN BÊN BÁN'
        // Apply font style
        worksheet.getCell(`B${endNumRow + 12}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`B${endNumRow + 12}`).alignment = {
            wrapText: true,
            vertical: 'middle',
            horizontal: 'center',
        }

        worksheet.mergeCells(`I${endNumRow + 12}:M${endNumRow + 12}`)
        worksheet.getCell(`I${endNumRow + 12}`).value = 'ĐẠI DIỆN BÊN MUA'
        // Apply font style
        worksheet.getCell(`I${endNumRow + 12}`).font = {
            name: 'Times New Roman',
            size: 18,
        }
        worksheet.getCell(`I${endNumRow + 12}`).alignment = {
            wrapText: true,
            vertical: 'middle',
            horizontal: 'center',
        }
        // Generate and save the Excel file
        const buffer = await workbook.xlsx.writeBuffer()
        saveAs(new Blob([buffer]), 'DH.xlsx')
    } catch (error) {
        console.log(error)
    }
}
