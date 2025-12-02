const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "whadventure",
});

// SALES //

// KPI Sales
app.get("/api/sales/performance/kpi", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT
      SUM(fs.LineTotal) AS total_revenue,
      SUM(fs.LineTotal - (fs.OrderQty * p.StandardCost)) AS total_profit,
      AVG(fs.LineTotal) AS avg_order_value
    FROM fact_sales fs
    JOIN dim_product p ON fs.product_id = p.product_id
    WHERE p.StandardCost IS NOT NULL
  `);
  res.json(
    rows[0] || { total_revenue: 0, total_profit: 0, avg_order_value: 0 }
  );
});

// Top 10 Produk
app.get("/api/sales/performance/top-products", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      p.product_name,
      p.category,
      p.subcategory,
      SUM(fs.OrderQty) AS total_qty,
      SUM(fs.LineTotal) AS total_revenue
    FROM fact_sales fs
    JOIN dim_product p 
      ON fs.product_id = p.product_id
    GROUP BY 
      p.product_id,
      p.product_name,
      p.category,
      p.subcategory
    ORDER BY total_revenue DESC
    LIMIT 10;
  `);
  res.json(rows);
});

// Discount Impact
app.get("/api/sales/performance/discount-impact", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT
      CASE WHEN UnitPriceDiscount > 0 THEN 'With Discount' ELSE 'No Discount' END AS discount_group,
      COUNT(*) AS order_count,
      SUM(LineTotal) AS total_revenue,
      AVG(LineTotal) AS avg_revenue_per_order
    FROM fact_sales
    GROUP BY discount_group
  `);
  res.json(rows);
});

// Revenue
app.get("/api/sales/performance/revenue", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      DATE_FORMAT(fs.OrderDate, '%Y-%m') AS month,
      SUM(fs.LineTotal) AS total_revenue
    FROM fact_sales fs
    GROUP BY DATE_FORMAT(fs.OrderDate, '%Y-%m')
    ORDER BY month;
  `);
  res.json(rows);
});

// CUSTOMERS //

// Top 10 Customer dengan Pembelian Terbanyak
app.get("/api/sales/performance/top-customers", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      c.full_name AS customer_name,
      SUM(fs.LineTotal) AS total_revenue,
      COUNT(*) AS total_orders
    FROM fact_sales fs
    JOIN dim_customer c 
      ON fs.customer_id = c.customer_id
    GROUP BY c.customer_id, c.full_name
    ORDER BY total_revenue DESC
    LIMIT 10;
  `);
  res.json(rows);
});

// Customer Type Transactions (total_transactions)
app.get(
  "/api/sales/performance/customer-type-transactions",
  async (req, res) => {
    const [rows] = await pool.query(`
    SELECT 
      c.person_type,
      COUNT(DISTINCT CONCAT(fs.customer_id, fs.OrderDate)) AS total_transactions,
      SUM(fs.LineTotal) AS total_revenue
    FROM fact_sales fs
    JOIN dim_customer c 
      ON fs.customer_id = c.customer_id
    GROUP BY c.person_type
    ORDER BY total_transactions DESC;
  `);
    res.json(rows);
  }
);

// Customer Type Revenue (total_revenue)
app.get("/api/sales/performance/customer-type-revenue", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      c.person_type,
      COUNT(DISTINCT CONCAT(fs.customer_id, fs.OrderDate)) AS total_transactions,
      SUM(fs.LineTotal) AS total_revenue
    FROM fact_sales fs
    JOIN dim_customer c 
      ON fs.customer_id = c.customer_id
    GROUP BY c.person_type
    ORDER BY total_revenue DESC;
  `);
  res.json(rows);
});

// Customer Tren
app.get("/api/sales/performance/customer-trend", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
    DATE_FORMAT(fs.OrderDate, '%Y-%m') AS period,
    COUNT(DISTINCT CASE 
                    WHEN DATE_FORMAT(first.first_purchase, '%Y-%m') = DATE_FORMAT(fs.OrderDate, '%Y-%m') 
                    THEN fs.customer_id 
                    END) AS new_customer,
    COUNT(DISTINCT CASE 
                    WHEN first.first_purchase < DATE_FORMAT(fs.OrderDate, '%Y-%m-01') 
                    THEN fs.customer_id 
                    END) AS loyal_customer
    FROM fact_sales fs
    JOIN (
        SELECT 
            customer_id, 
            MIN(OrderDate) AS first_purchase
        FROM fact_sales
        GROUP BY customer_id
    ) AS first 
        ON first.customer_id = fs.customer_id
    GROUP BY DATE_FORMAT(fs.OrderDate, '%Y-%m')
    ORDER BY period;

  `);
  res.json(rows);
});

// PRODUCT //

// Most Sold Products
app.get("/api/sales/product/mostsold", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      p.product_name,
      p.category,
      p.subcategory,
      SUM(fs.OrderQty) AS total_qty,
      SUM(fs.LineTotal) AS total_revenue
    FROM fact_sales fs
    JOIN dim_product p 
      ON fs.product_id = p.product_id
    GROUP BY 
      p.product_id,
      p.product_name,
      p.category,
      p.subcategory
    ORDER BY total_qty DESC
    LIMIT 10;
  `);
  res.json(rows);
});

// Least Sold Products
app.get("/api/sales/product/leastsold", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      p.product_name,
      p.category,
      p.subcategory,
      SUM(fs.OrderQty) AS total_qty,
      SUM(fs.LineTotal) AS total_revenue
    FROM fact_sales fs
    JOIN dim_product p 
      ON fs.product_id = p.product_id
    GROUP BY 
      p.product_id,
      p.product_name,
      p.category,
      p.subcategory
    ORDER BY total_qty ASC
    LIMIT 10;
  `);
  res.json(rows);
});

// Top 10 Produk Paling Sering Diskon
app.get("/api/sales/product/top-discounted-products", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      p.product_name,
      COUNT(*) AS discount_count,
      SUM(fs.UnitPriceDiscount) AS total_discount_amount
    FROM fact_sales fs
    JOIN dim_product p ON p.product_id = fs.product_id
    WHERE fs.UnitPriceDiscount > 0
    GROUP BY p.product_name
    ORDER BY discount_count DESC
    LIMIT 10;
  `);
  res.json(rows);
});

// EMPLOYEES //

// Employee Performance
app.get("/api/sales/employee/employee-performance", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
          e.full_name,
          SUM(fs.LineTotal) AS total_sales
      FROM fact_sales fs
      JOIN dim_employee e ON e.employee_id = fs.employee_id
      GROUP BY e.employee_id, e.full_name
      ORDER BY total_sales DESC
      `);
  res.json(rows);
});

// Produk paling sering dijual oleh tiap employee
app.get("/api/sales/employee/top-products", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      e.full_name,
      p.product_name,
      SUM(fs.OrderQty) AS total_sold
    FROM fact_sales fs
    JOIN dim_employee e ON fs.employee_id = e.employee_id
    JOIN dim_product p ON fs.product_id = p.product_id
    GROUP BY e.employee_id, p.product_id
    ORDER BY total_sold DESC
  `);

  // Kelompokkan by employee lalu ambil produk dengan total_sold terbesar
  const result = Object.values(
    rows.reduce((acc, row) => {
      if (
        !acc[row.full_name] ||
        row.total_sold > acc[row.full_name].total_sold
      ) {
        acc[row.full_name] = row;
      }
      return acc;
    }, {})
  );

  res.json(result);
});

// Employee Monthly Performance Trend
app.get("/api/sales/employee/monthly-trend", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      e.employee_id,
      e.full_name,
      DATE_FORMAT(fs.OrderDate, '%Y-%m') AS period,
      SUM(fs.LineTotal) AS total_sales
    FROM fact_sales fs
    JOIN dim_employee e ON fs.employee_id = e.employee_id
    GROUP BY e.employee_id, period
    ORDER BY period, e.full_name;
  `);

  res.json(rows);
});

// TIME SERIES //

// Revenue Trend: Yearly, Monthly, Weekly Drill-Down
app.get("/api/sales/years", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT d.year
      FROM fact_sales fs
      JOIN dim_date d ON fs.date_id = d.date_id
      ORDER BY d.year DESC
    `);
    const years = rows.map((row) => row.year); // row.year harus number
    res.json(years);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch years" });
  }
});

app.get("/api/sales/monthly", async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const [rows] = await pool.query(
    `
    SELECT 
      d.month_name,
      d.month,
      SUM(fs.LineTotal) AS revenue
    FROM fact_sales fs
    JOIN dim_date d ON fs.date_id = d.date_id
    WHERE d.year = ?
    GROUP BY d.month, d.month_name
    ORDER BY d.month
  `,
    [year]
  );
  res.json(rows);
});

app.get("/api/sales/weekly", async (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) {
    return res.status(400).json({ error: "year and month required" });
  }

  const [rows] = await pool.query(
    `
    SELECT 
      WEEK(d.full_date) AS week_number,
      DATE(MIN(d.full_date)) AS week_start,
      SUM(fs.LineTotal) AS revenue
    FROM fact_sales fs
    JOIN dim_date d ON fs.date_id = d.date_id
    WHERE d.year = ? AND d.month = ?
    GROUP BY WEEK(d.full_date)
    ORDER BY week_number
  `,
    [year, month]
  );

  res.json(rows);
});

// Weekend vs Weekday Sales
app.get("/api/sales/trends/weekend-weekdays", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT
        CASE 
            WHEN DAYOFWEEK(OrderDate) IN (1, 7) THEN 'Weekend'
            ELSE 'Weekday'
        END AS day_type,
        SUM(LineTotal) AS total_sales
    FROM fact_sales
    GROUP BY day_type;
  `);
  res.json(rows);
});

// Bulan paling efektif untuk promosi
app.get("/api/sales/trends/best-month", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
        MONTH(fs.OrderDate) AS month,
        DATE_FORMAT(fs.OrderDate, '%M') AS month_name,
        SUM(fs.LineTotal) AS total_sales
    FROM fact_sales fs
    GROUP BY MONTH(fs.OrderDate), DATE_FORMAT(fs.OrderDate, '%M')
    ORDER BY MONTH(fs.OrderDate);
  `);

  res.json(rows);
});

// PURCHASE //

// KPI Purchase
app.get("/api/purchase/performance/kpi", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT
      SUM(LineTotal) AS total_purchasing_amount,
      SUM(OrderQty) AS total_quantity_purchased,
      AVG(fp.LineTotal) AS avg_purchase_value
    FROM fact_purchasing fp 
  `);
  res.json(rows[0] || { total_expenditure: 0, avg_purchase_value: 0 });
});

// Top Product Purchase
app.get("/api/purchase/performance/top-product-purchase", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      p.product_name,
      p.category,
      p.subcategory,
      SUM(fp.OrderQty) AS total_qty,
      SUM(fp.LineTotal) AS total_purchased
    FROM fact_purchasing fp
    JOIN dim_product p 
      ON fp.product_id = p.product_id
    GROUP BY 
      p.product_id,
      p.product_name,
      p.category,
      p.subcategory
    ORDER BY total_qty DESC
    LIMIT 10;
  `);

  res.json(rows);
});

// Top Supplier by Purchase Amount
app.get("/api/purchase/performance/top-supplier", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
        s.supplier_name,
        SUM(fp.OrderQty) AS total_qty,
        SUM(fp.LineTotal) AS total_spent
    FROM fact_purchasing fp
    JOIN dim_supplier s 
        ON fp.supplier_id = s.supplier_id
    GROUP BY 
        s.supplier_id, s.supplier_name
    ORDER BY total_qty DESC
    LIMIT 10;
  `);

  res.json(rows);
});

// Most Rejected Product
app.get("/api/purchase/insight/most-rejected", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      p.product_name,
      p.category,
      SUM(fp.RejectedQty) AS rejected_qty
    FROM fact_purchasing fp
    JOIN dim_product p 
      ON fp.product_id = p.product_id
    GROUP BY p.product_id, p.product_name, p.category
    HAVING rejected_qty > 0
    ORDER BY rejected_qty DESC
    LIMIT 10;
  `);
  res.json(rows);
});

// GET all purchase years
app.get("/api/purchase/years", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT d.year
      FROM fact_purchasing fp
      JOIN dim_date d ON fp.date_id = d.date_id
      ORDER BY d.year DESC
    `);

    const years = rows.map((r) => r.year);
    res.json(years);
  } catch (err) {
    console.error("Purchase Years Error:", err);
    res.status(500).json({ error: "Failed to fetch purchase years" });
  }
});

app.get("/api/purchase/monthly", async (req, res) => {
  const year = req.query.year || new Date().getFullYear();

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        d.month_name,
        d.month,
        SUM(fp.LineTotal) AS total_purchase
      FROM fact_purchasing fp
      JOIN dim_date d ON fp.date_id = d.date_id
      WHERE d.year = ?
      GROUP BY d.month, d.month_name
      ORDER BY d.month
      `,
      [year]
    );

    res.json(rows);
  } catch (err) {
    console.error("Purchase Monthly Error:", err);
    res.status(500).json({ error: "Failed to fetch monthly purchase" });
  }
});

app.get("/api/purchase/weekly", async (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ error: "year and month required" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        WEEK(d.full_date) AS week_number,
        DATE(MIN(d.full_date)) AS week_start,
        SUM(fp.LineTotal) AS total_purchase
      FROM fact_purchasing fp
      JOIN dim_date d ON fp.date_id = d.date_id
      WHERE d.year = ? AND d.month = ?
      GROUP BY WEEK(d.full_date)
      ORDER BY week_number
      `,
      [year, month]
    );

    res.json(rows);
  } catch (err) {
    console.error("Purchase Weekly Error:", err);
    res.status(500).json({ error: "Failed to fetch weekly purchase" });
  }
});

// Jalankan server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
