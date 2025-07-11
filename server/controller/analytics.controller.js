import User from "../model/user.model.js"
import Product from "../model/product.model.js"

const analyticsData = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({})
        const totalProducts = await Product.countDocuments({})
        const salesData = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            }
        ])
        const {totalSales, totalRevenue} = salesData[0] || {totalSales: 0, totalRevenue: 0}
        return {
            totalUsers,
            totalProducts,
            totalSales,
            totalRevenue
        }
    } catch (err) {
        console.log("error in get analytics data controller", err.message)
        throw new Error("Internal server error")
    }
}

const dailySalesData = async (startDate, endDate) => {
    try {
        const salesData = await Product.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ])
        const datesArray = getsDatesInRange(startDate, endDate);

        return datesArray.map(date => {
            const data = salesData.find(sale => sale._id === date)
            return {
                date,
                sales: data ? data.sales : 0,
                revenue: data ? data.revenue : 0
            }
        })
    } catch (err) {
        console.log("error in get daily sales data", err.message)
        throw new Error("Internal server error")
    }
}

const getsDatesInRange = (startDate, endDate) => {
    const dates = []
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0])
        currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
}

export const getAnalyticsData = async (req, res) => {
    try {
        const analyticsData = await analyticsData(req, res)
        const endDate = new Date()
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago

       const dailySalesData = await dailySalesData(startDate, endDate);

        res.status(200).json({
            analyticsData,
            dailySalesData
        })
 
    } catch (err) {
        console.log("error in get analytics data controller", err.message)
        return res.status(500).json({
            status: "fail",
            message: "Internal server error"
        })
    }
}

