import React, { useState, useEffect } from "react";
import "./platformAnalytics.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

function PlatformAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");

      const [overviewRes, suppliersRes, productsRes, trendsRes] = await Promise.all([
        fetch("http://localhost:4000/api/admin/metrics/overview", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:4000/api/admin/metrics/top-suppliers?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:4000/api/admin/metrics/top-products?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:4000/api/admin/metrics/trends?months=6", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!overviewRes.ok || !suppliersRes.ok || !productsRes.ok || !trendsRes.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const [overview, suppliers, products, trends] = await Promise.all([
        overviewRes.json(),
        suppliersRes.json(),
        productsRes.json(),
        trendsRes.json(),
      ]);

      setStats({
        ...overview.overview,
        topSuppliers: suppliers.topSuppliers,
        topProducts: products.topByOrders,
        revenueChart: trends.revenueChart,
        ordersChart: trends.ordersChart,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>Platform Analytics</h2>
        <button onClick={fetchAnalytics} className="refresh-button">
          Refresh
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!stats ? (
        <p className="no-data">No analytics data found</p>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="analytics-stats-grid">
            <div className="analytics-card">
              <h4>Total Manufacturers</h4>
              <p>{stats.totalManufacturers || 0}</p>
            </div>

            <div className="analytics-card">
              <h4>Active Suppliers</h4>
              <p>{stats.activeSuppliers || 0}</p>
            </div>

            <div className="analytics-card">
              <h4>Pending Suppliers</h4>
              <p>{stats.pendingSuppliers || 0}</p>
            </div>

            <div className="analytics-card">
              <h4>Total Orders</h4>
              <p>{stats.totalOrders || 0}</p>
            </div>

            <div className="analytics-card">
              <h4>Revenue (ETB)</h4>
              <p>{stats.revenue ? stats.revenue.toLocaleString() : 0}</p>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="chart-section">
            <h3>Revenue Trend (Last 6 Months)</h3>
            <div className="chart-box">
              {stats.revenueChart && stats.revenueChart.labels && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={stats.revenueChart.labels.map((label, idx) => ({
                      month: label,
                      revenue: stats.revenueChart.values[idx],
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Orders Trend Chart */}
          <div className="chart-section">
            <h3>Orders Trend (Last 6 Months)</h3>
            <div className="chart-box">
              {stats.ordersChart && stats.ordersChart.labels && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={stats.ordersChart.labels.map((label, idx) => ({
                      month: label,
                      orders: stats.ordersChart.values[idx],
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Suppliers */}
          {stats.topSuppliers && stats.topSuppliers.length > 0 && (
            <div className="chart-section">
              <h3>Top Suppliers (Last 6 Months)</h3>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.topSuppliers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="supplierName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orderCount" fill="#8b5cf6" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Products */}
          {stats.topProducts && stats.topProducts.length > 0 && (
            <div className="chart-section">
              <h3>Top Products by Quantity (Last 6 Months)</h3>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orderedQty" fill="#f59e0b" name="Ordered Quantity" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PlatformAnalytics;
