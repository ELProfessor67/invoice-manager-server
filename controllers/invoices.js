import catchAsyncError from '../middlewares/catchAsyncError.js';
import InvoiceModel from '../models/invoices.js'; 
import {dirname} from 'path';
import {fileURLToPath} from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url))



export const AddInvoice = catchAsyncError(async (req, res) => {
    try {
        req.body.owner = req.user._id 
        const newData = new InvoiceModel(req.body);
        await newData.save();
        res.status(201).json(newData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


export const deleteInvoice = catchAsyncError(async (req, res) => {
    try {
        const deletedData = await InvoiceModel.findByIdAndDelete(req.params.id);
        if (!deletedData) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.json({ message: 'Data deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export const UpdateInvoice= catchAsyncError(async (req, res) => {
    try {
        const updatedData = await InvoiceModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedData) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.json(updatedData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



// export const readInvoice = catchAsyncError(async (req, res) => {
//     try {
//         let allData;
//         if (req.user.role == 'admin'){

//             allData = await InvoiceModel.find();
//         }else{
//             allData = await InvoiceModel.find({owner: req.user._id});

//         }
//         const groupedData = {};

//         allData.forEach(data => {
//             const date = data.date.toLocaleDateString('en-GB', {
//                 day: '2-digit',
//                 month: '2-digit',
//                 year: 'numeric'
//             });
//             if (!groupedData[date]) {
//                 groupedData[date] = [];
//             }
//             groupedData[date].push(data);
//         });

//         res.json(groupedData);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });



export const readInvoice = catchAsyncError(async (req, res) => {
    try {
        let allData;
        if (req.user.role == 'admin'){
            allData = await InvoiceModel.find();
        } else {
            allData = await InvoiceModel.find({ owner: req.user._id });
        }

        const groupedData = [];

        allData.forEach(data => {
            const date = data.date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const invoiceIndex = groupedData.findIndex(item => item.date === date);
            if (invoiceIndex === -1) {
                groupedData.push({ date, invoices: [data], count: 1, total: data.total });
            } else {
                groupedData[invoiceIndex].invoices.push(data);
                groupedData[invoiceIndex].count += 1;
                groupedData[invoiceIndex].total += data.total;
            }
        });

        res.json(groupedData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


export const getInvoicesByDate = catchAsyncError(async (req, res) => {
    try {
      
        let allData;
        if (req.user.role === 'admin') {
            allData = await InvoiceModel.find().populate("owner");
        } else {
            allData = await InvoiceModel.find({ owner: req.user._id }).populate("owner");
        }

        const [day,month,year] = req.params.date.split("-")
  

        const filteredData = allData.filter(data => {
            const dataDate = new Date(data.date);
          
            return Number(day) == dataDate.getDate() && Number(month) == dataDate.getMonth()+1 && Number(year) == dataDate.getFullYear();
        });


        res.json(filteredData);
    } catch (err) {
        console.error(err); // Log error
        res.status(500).json({ message: err.message });
    }
});