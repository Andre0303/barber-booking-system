import { useMemo, useState } from "react";
import BarberManagement from "./BarberManagement";
import WorkingHours from "./WorkingHours";

function AdminDashboard({
    bookings = [],
    onBookingStatusUpdated,
    onBack,
    onLogout
}) {
 
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [activeSection, setActiveSection] = useState("dashboard");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [updatingId, setUpdatingId] = useState(null);


    // ======================================
    // STATUS
    // ======================================

    const getStatus = (booking) => {

        return (
            booking.status ||
            booking.booking_status ||
            "Pending"
        ).toUpperCase();

    };


    // ======================================
    // BOOKING ID
    // ======================================

    const getBookingId = (booking) => {

        return (
            booking.id ||
            booking.booking_id
        );

    };


    // ======================================
    // FILTER BOOKINGS
    // ======================================

    const filteredBookings = useMemo(() => {

        return bookings.filter((booking) => {

            const search =
                searchTerm.toLowerCase().trim();


            const matchesSearch =
                !search ||
                String(
                    booking.customer ||
                    booking.customer_name ||
                    ""
                )
                    .toLowerCase()
                    .includes(search) ||

                String(
                    booking.phone ||
                    ""
                )
                    .toLowerCase()
                    .includes(search) ||

                String(
                    booking.service ||
                    ""
                )
                    .toLowerCase()
                    .includes(search) ||

                String(
                    booking.barber ||
                    ""
                )
                    .toLowerCase()
                    .includes(search) ||

                String(
                    booking.reference ||
                    ""
                )
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =
                statusFilter === "ALL" ||
                getStatus(booking) === statusFilter;


            return (
                matchesSearch &&
                matchesStatus
            );

        });

    }, [
        bookings,
        searchTerm,
        statusFilter
    ]);


    // ======================================
    // STATISTICS
    // ======================================

    const totalBookings =
        bookings.length;


    const pendingBookings =
        bookings.filter(
            (booking) =>
                getStatus(booking) === "PENDING"
        ).length;


    const confirmedBookings =
        bookings.filter(
            (booking) =>
                getStatus(booking) === "CONFIRMED"
        ).length;


    const completedBookings =
        bookings.filter(
            (booking) =>
                getStatus(booking) === "COMPLETED"
        ).length;


    const cancelledBookings =
        bookings.filter(
            (booking) =>
                getStatus(booking) === "CANCELLED"
        ).length;


    // ======================================
    // TODAY'S DATE
    // ======================================

    const today = new Date()
        .toISOString()
        .split("T")[0];


    // ======================================
    // TODAY'S BOOKINGS
    // ======================================

    const todayBookings =
        bookings.filter((booking) => {

            const bookingDate =
                booking.date ||
                booking.booking_date;

            if (!bookingDate) {
                return false;
            }

            return String(
                bookingDate
            ).slice(0, 10) === today;

        });


    // ======================================
    // UPDATE STATUS
    // ======================================

    const updateBookingStatus = async (
        bookingId,
        newStatus
    ) => {

        try {

            setUpdatingId(bookingId);


            const response = await fetch(
                `http://localhost:5000/api/bookings/${bookingId}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to update booking."
                );

            }


            if (onBookingStatusUpdated) {

                onBookingStatusUpdated(
                    bookingId,
                    newStatus
                );

            }


        } catch (error) {

            console.error(
                "Booking status error:",
                error
            );


            alert(
                error.message ||
                "Something went wrong."
            );


        } finally {

            setUpdatingId(null);

        }

    };


    // ======================================
    // FORMAT DATE
    // ======================================

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }


        const parsedDate =
            new Date(date);


        if (isNaN(parsedDate)) {
            return date;
        }


        return parsedDate.toLocaleDateString(
            "en-ZA",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // ======================================
    // STATUS BADGE
    // ======================================

    const StatusBadge = ({ status }) => {

        return (
            <span
                className={
                    `admin-status-badge ${status.toLowerCase()}`
                }
            >
                <span className="admin-status-dot"></span>
                {status}
            </span>
        );

    };


    // ======================================
    // DASHBOARD
    // ======================================

    const renderDashboard = () => {

        return (

            <>

                {/* ==================================
                    PAGE HEADER
                ================================== */}

                <div className="admin-page-header">

                    <div>

                        <span className="admin-eyebrow">
                            ELITE CUTS MANAGEMENT
                        </span>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Manage appointments,
                            barbers and working hours.
                        </p>

                    </div>


                    <button
                        className="admin-refresh-button"
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        ↻ Refresh
                    </button>

                </div>


                {/* ==================================
                    STATISTICS
                ================================== */}

                <div className="admin-stat-grid">


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            📅
                        </div>

                        <div>

                            <span>
                                TOTAL BOOKINGS
                            </span>

                            <strong>
                                {totalBookings}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card pending-card">

                        <div className="admin-stat-icon">
                            ⏳
                        </div>

                        <div>

                            <span>
                                PENDING
                            </span>

                            <strong>
                                {pendingBookings}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card confirmed-card">

                        <div className="admin-stat-icon">
                            ✓
                        </div>

                        <div>

                            <span>
                                CONFIRMED
                            </span>

                            <strong>
                                {confirmedBookings}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card completed-card">

                        <div className="admin-stat-icon">
                            ★
                        </div>

                        <div>

                            <span>
                                COMPLETED
                            </span>

                            <strong>
                                {completedBookings}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    SECONDARY STATS
                ================================== */}

                <div className="admin-summary-row">

                    <div className="admin-summary-card">

                        <span>
                            TODAY'S BOOKINGS
                        </span>

                        <strong>
                            {todayBookings.length}
                        </strong>

                    </div>


                    <div className="admin-summary-card">

                        <span>
                            CANCELLED
                        </span>

                        <strong>
                            {cancelledBookings}
                        </strong>

                    </div>


                    <div className="admin-summary-card">

                        <span>
                            ACTIVE BOOKINGS
                        </span>

                        <strong>
                            {
                                pendingBookings +
                                confirmedBookings
                            }
                        </strong>

                    </div>

                </div>


                {/* ==================================
                    BOOKING OVERVIEW
                ================================== */}

                <div className="admin-overview-grid">


                    <div className="admin-overview-card">

                        <div className="overview-card-header">

                            <div>

                                <span>
                                    BOOKING STATUS
                                </span>

                                <h3>
                                    Overview
                                </h3>

                            </div>

                        </div>


                        <div className="status-overview-list">


                            <div className="status-overview-item">

                                <div>

                                    <span className="overview-dot pending"></span>

                                    Pending

                                </div>

                                <strong>
                                    {pendingBookings}
                                </strong>

                            </div>


                            <div className="status-overview-item">

                                <div>

                                    <span className="overview-dot confirmed"></span>

                                    Confirmed

                                </div>

                                <strong>
                                    {confirmedBookings}
                                </strong>

                            </div>


                            <div className="status-overview-item">

                                <div>

                                    <span className="overview-dot completed"></span>

                                    Completed

                                </div>

                                <strong>
                                    {completedBookings}
                                </strong>

                            </div>


                            <div className="status-overview-item">

                                <div>

                                    <span className="overview-dot cancelled"></span>

                                    Cancelled

                                </div>

                                <strong>
                                    {cancelledBookings}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* TODAY */}

                    <div className="admin-overview-card">

                        <div className="overview-card-header">

                            <div>

                                <span>
                                    TODAY
                                </span>

                                <h3>
                                    Today's Appointments
                                </h3>

                            </div>

                        </div>


                        {todayBookings.length === 0 ? (

                            <div className="empty-today">

                                <div>
                                    📅
                                </div>

                                <p>
                                    No appointments scheduled
                                    for today.
                                </p>

                            </div>

                        ) : (

                            <div className="today-list">

                                {todayBookings
                                    .slice(0, 5)
                                    .map((booking) => (

                                        <div
                                            className="today-item"
                                            key={
                                                getBookingId(
                                                    booking
                                                )
                                            }
                                        >

                                            <div>

                                                <strong>
                                                    {
                                                        booking.time ||
                                                        booking.booking_time ||
                                                        "—"
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        booking.customer ||
                                                        booking.customer_name ||
                                                        "Customer"
                                                    }
                                                </span>

                                            </div>


                                            <StatusBadge
                                                status={
                                                    getStatus(
                                                        booking
                                                    )
                                                }
                                            />

                                        </div>

                                    ))}

                            </div>

                        )}

                    </div>

                </div>


                {/* ==================================
                    BOOKINGS
                ================================== */}

                {renderBookingsTable()}

            </>

        );

    };


    // ======================================
    // BOOKINGS TABLE
    // ======================================

    const renderBookingsTable = () => {

        return (

            <div className="admin-bookings-card">

                <div className="admin-bookings-header">

                    <div>

                        <span>
                            APPOINTMENT MANAGEMENT
                        </span>

                        <h2>
                            Customer Bookings
                        </h2>

                    </div>

                    <strong>
                        {filteredBookings.length}
                    </strong>

                </div>


                {/* FILTERS */}

                <div className="admin-filters">

                    <input
                        type="text"
                        placeholder="Search customer, phone, barber or reference..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                    />


                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Statuses
                        </option>

                        <option value="PENDING">
                            Pending
                        </option>

                        <option value="CONFIRMED">
                            Confirmed
                        </option>

                        <option value="COMPLETED">
                            Completed
                        </option>

                        <option value="CANCELLED">
                            Cancelled
                        </option>

                    </select>

                </div>


                {/* TABLE */}

                {filteredBookings.length === 0 ? (

                    <div className="admin-empty">

                        <div className="admin-empty-icon">
                            📅
                        </div>

                        <h3>
                            No bookings found
                        </h3>

                        <p>
                            Try changing your search
                            or status filter.
                        </p>

                    </div>

                ) : (

                    <div className="admin-table-wrapper">

                        <table className="admin-bookings-table">

                            <thead>

                                <tr>

                                    <th>
                                        REFERENCE
                                    </th>

                                    <th>
                                        CUSTOMER
                                    </th>

                                    <th>
                                        SERVICE
                                    </th>

                                    <th>
                                        BARBER
                                    </th>

                                    <th>
                                        DATE
                                    </th>

                                    <th>
                                        TIME
                                    </th>

                                    <th>
                                        STATUS
                                    </th>

                                    <th>
                                        ACTION
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredBookings.map(
                                    (booking) => {

                                        const status =
                                            getStatus(
                                                booking
                                            );

                                        const bookingId =
                                            getBookingId(
                                                booking
                                            );


                                        return (

                                            <tr
                                                key={
                                                    bookingId
                                                }
                                            >

                                                <td>

                                                    <strong className="reference-text">

                                                        {
                                                            booking.reference ||
                                                            booking.booking_reference ||
                                                            `EC-${bookingId}`
                                                        }

                                                    </strong>

                                                </td>


                                                <td>

                                                    <div className="customer-cell">

                                                        <strong>
                                                            {
                                                                booking.customer ||
                                                                booking.customer_name ||
                                                                "—"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                booking.phone ||
                                                                ""
                                                            }
                                                        </span>

                                                    </div>

                                                </td>


                                                <td>
                                                    {
                                                        booking.service ||
                                                        "—"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        booking.barber ||
                                                        "—"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        formatDate(
                                                            booking.date ||
                                                            booking.booking_date
                                                        )
                                                    }
                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            booking.time ||
                                                            booking.booking_time ||
                                                            "—"
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    <StatusBadge
                                                        status={
                                                            status
                                                        }
                                                    />

                                                </td>


                                                <td>

                                                    <div className="admin-action-buttons">


                                                        {status === "PENDING" && (

                                                            <button
                                                                className="action-confirm"
                                                                disabled={
                                                                    updatingId ===
                                                                    bookingId
                                                                }
                                                                onClick={() =>
                                                                    updateBookingStatus(
                                                                        bookingId,
                                                                        "Confirmed"
                                                                    )
                                                                }
                                                            >
                                                                ✓ Confirm
                                                            </button>

                                                        )}


                                                        {status === "CONFIRMED" && (

                                                            <button
                                                                className="action-complete"
                                                                disabled={
                                                                    updatingId ===
                                                                    bookingId
                                                                }
                                                                onClick={() =>
                                                                    updateBookingStatus(
                                                                        bookingId,
                                                                        "Completed"
                                                                    )
                                                                }
                                                            >
                                                                ✓ Complete
                                                            </button>

                                                        )}


                                                        {(status === "PENDING" ||
                                                            status === "CONFIRMED") && (

                                                            <button
                                                                className="action-cancel"
                                                                disabled={
                                                                    updatingId ===
                                                                    bookingId
                                                                }
                                                                onClick={() =>
                                                                    updateBookingStatus(
                                                                        bookingId,
                                                                        "Cancelled"
                                                                    )
                                                                }
                                                            >
                                                                × Cancel
                                                            </button>

                                                        )}


                                                        {status === "COMPLETED" && (

                                                            <span className="completed-text">
                                                                Completed
                                                            </span>

                                                        )}


                                                        {status === "CANCELLED" && (

                                                            <span className="cancelled-text">
                                                                Cancelled
                                                            </span>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        );

    };


    // ======================================
    // RENDER
    // ======================================

    return (

        <div className="admin-dashboard">


            {/* ==================================
                SIDEBAR
            ================================== */}

            <aside className="admin-sidebar">


                <div className="admin-logo">

                    ELITE
                    <span>CUTS</span>

                </div>


                <div className="admin-panel-label">
                    ADMIN PANEL
                </div>


                <nav className="admin-nav">


                    <button
                        className={
                            activeSection === "dashboard"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveSection(
                                "dashboard"
                            )
                        }
                    >

                        <span>
                            ▦
                        </span>

                        Dashboard

                    </button>


                    <button
                        className={
                            activeSection === "barbers"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveSection(
                                "barbers"
                            )
                        }
                    >

                        <span>
                            ✂
                        </span>

                        Barbers

                    </button>


                    <button
                        className={
                            activeSection === "hours"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveSection(
                                "hours"
                            )
                        }
                    >

                        <span>
                            ◷
                        </span>

                        Working Hours

                    </button>

                </nav>


                <div className="admin-sidebar-bottom">


                    <button
                        className="sidebar-back"
                        onClick={onBack}
                    >
                        ← Back to Website
                    </button>


                    <button
                        className="sidebar-logout"
                        onClick={onLogout}
                    >
                        ⇥ Logout
                    </button>

                </div>

            </aside>


            {/* ==================================
                MAIN CONTENT
            ================================== */}

            <main className="admin-main">


                {/* DASHBOARD */}

                {activeSection === "dashboard" &&
                    renderDashboard()
                }


                {/* BARBERS */}

                {activeSection === "barbers" && (

                    <div className="admin-section-page">

                        <div className="admin-page-header">

                            <div>

                                <span className="admin-eyebrow">
                                    ELITE CUTS MANAGEMENT
                                </span>

                                <h1>
                                    Barbers
                                </h1>

                                <p>
                                    Manage your barbers
                                    and their availability.
                                </p>

                            </div>

                        </div>


                        <BarberManagement />

                    </div>

                )}


                {/* WORKING HOURS */}

                {activeSection === "hours" && (

                    <div className="admin-section-page">

                        <div className="admin-page-header">

                            <div>

                                <span className="admin-eyebrow">
                                    ELITE CUTS MANAGEMENT
                                </span>

                                <h1>
                                    Working Hours
                                </h1>

                                <p>
                                    Manage barber availability
                                    and working schedules.
                                </p>

                            </div>

                        </div>


                        <WorkingHours />

                    </div>

                )}

            </main>

        </div>

    );

}

export default AdminDashboard;