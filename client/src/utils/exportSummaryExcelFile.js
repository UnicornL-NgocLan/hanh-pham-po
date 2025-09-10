import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import moment from 'moment'

export const exportSummaryExcelFile = async (data) => {
    try {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('File tổng hợp')

        //  Get keys from the first object as headers
        const headers = Object.keys(data[0])

        // Add header row
        worksheet.addRow(headers)
        data.forEach((item) => {
            worksheet.addRow(headers.map((h) => item[h]))
        })

        worksheet.getRow(1).font = { bold: true }
        // Auto column width
        worksheet.columns.forEach((col) => {
            let maxLength = 10
            col.eachCell({ includeEmpty: true }, (cell) => {
                const val = cell.value ? cell.value.toString() : ''
                maxLength = Math.max(maxLength, val.length)
            })
            col.width = maxLength + 2
        })

        const buffer = await workbook.xlsx.writeBuffer()
        const fileName = `File tổng hợp.xlsx`

        saveAs(new Blob([buffer]), fileName)
    } catch (error) {
        alert(error)
        console.log(error)
    }
}
