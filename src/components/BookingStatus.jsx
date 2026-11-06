import { useState } from "react";

function BookingStatus() {

    const [reference, setReference] = useState("");

    const [phone, setPhone] = useState("");

    const [booking, setBooking] = useState(null);

    const [loading, setLoading] = useState(false);

    const [cancelling, setCancelling] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // ======================================
    // SEARCH BOOKING
    // ======================================

    const searchBooking = async (e) => {

        e.preventDefault();

        setError("");

        setSuccess("");

        setBooking(null);


        // --------------------------------------
        // VALIDATE REFERENCE
        // --------------------------------------

        if (!reference.trim()) {

            setError(
                "Please enter your booking reference."
            );

            return;

        }


        // --------------------------------------
        // VALIDATE PHONE
        // --------------------------------------

        if (!phone.trim()) {

            setError(
                "Please enter the phone number used when booking."
            );

            return;

        }


        try {

            setLoading(true);


            // --------------------------------------
            // SEARCH USING REFERENCE + PHONE
            // --------------------------------------

            const response = await fetch(

                `http://localhost:5000/api/bookings/reference/${encodeURIComponent(
                    reference.trim().toUpperCase()
                )}/verify`,

                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        phone: phone.trim()
                    })

                }

            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(

                    data.message ||
                    "Booking could not be verified."

                );

            }


            setBooking(
                data.booking || data
            );


        } catch (error) {

            console.error(
                "Booking verification error:",
                error
            );


            setError(

                error.message ||
                "Could not verify your booking."

            );

        } finally {

            setLoading(false);

        }

    };


    // ======================================
    // CANCEL BOOKING
    // ======================================

    const cancelBooking = async () => {

        if (!booking) {
            return;
        }


        const bookingReference =
            booking.reference ||
            booking.booking_reference;


        if (!bookingReference) {

            setError(
                "Booking reference could not be found."
            );

            return;

        }


        // --------------------------------------
        // CONFIRM CANCELLATION
        // --------------------------------------

        const confirmed =
            window.confirm(

                "Are you sure you want to cancel this booking?\n\n" +

                "Booking: " +
                bookingReference +

                "\n\n" +

                "This action cannot be undone."

            );


        if (!confirmed) {

            return;

        }


        try {

            setCancelling(true);

            setError("");

            setSuccess("");


            // --------------------------------------
            // SEND REFERENCE + PHONE
            // --------------------------------------

            const response =
                await fetch(

                    `http://localhost:5000/api/bookings/reference/${encodeURIComponent(
                        bookingReference
                    )}/cancel`,

                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            phone: phone.trim()
                        })

                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(

                    data.message ||
                    "Could not cancel booking."

                );

            }


            // --------------------------------------
            // UPDATE SCREEN
            // --------------------------------------

            setBooking(
                previousBooking => ({

                    ...previousBooking,

                    status: "Cancelled"

                })
            );


            setSuccess(
                "Your booking has been cancelled successfully."
            );


        } catch (error) {

            console.error(
                "Cancel booking error:",
                error
            );


            setError(

                error.message ||
                "Could not cancel booking."

            );

        } finally {

            setCancelling(false);

        }

    };


    // ======================================
    // GET STATUS
    // ======================================

    const getStatus = () => {

        if (!booking) {

            return "PENDING";

        }


        return (

            booking.status ||
            booking.booking_status ||
            "Pending"

        ).toUpperCase();

    };


    // ======================================
    // STATUS MESSAGE
    // ======================================

    const getStatusMessage = () => {

        const status =
            getStatus();


        if (status === "PENDING") {

            return (
                "Your booking has been received and is waiting for confirmation."
            );

        }


        if (status === "CONFIRMED") {

            return (
                "Your appointment has been confirmed. We look forward to seeing you!"
            );

        }


        if (status === "COMPLETED") {

            return (
                "Your appointment has been completed. Thank you for choosing Elite Cuts!"
            );

        }


        if (status === "CANCELLED") {

            return (
                "This appointment has been cancelled."
            );

        }


        return (
            "Your booking has been received."
        );

    };


    // ======================================
    // FORMAT DATE
    // ======================================

    const formatDate = (date) => {

        if (!date) {

            return "—";

        }


        const formattedDate =
            new Date(date);


        if (isNaN(formattedDate)) {

            return date;

        }


        return formattedDate.toLocaleDateString(

            "en-ZA",

            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }

        );

    };


    // ======================================
    // STATUS CLASS
    // ======================================

    const getStatusClass = () => {

        return getStatus().toLowerCase();

    };


    // ======================================
    // RENDER
    // ======================================

    return (

        <section
            className="booking-status-section"
            id="booking-status"
        >

            <div className="booking-status-container">


                {/* ======================================
                    HEADER
                ====================================== */}

                <div className="booking-status-header">

                    <span className="status-label">
                        ELITE CUTS
                    </span>


                    <h2>

                        CHECK YOUR
                        <span> BOOKING</span>

                    </h2>


                    <p>

                        Enter your booking reference
                        and phone number to view
                        your appointment.

                    </p>

                </div>


                {/* ======================================
                    SEARCH
                ====================================== */}

                <div className="booking-search-card">

                    <form
                        className="booking-status-form"
                        onSubmit={searchBooking}
                    >

                        {/* REFERENCE */}

                        <div className="reference-input-wrapper">

                            <label>
                                BOOKING REFERENCE
                            </label>


                            <input

                                type="text"

                                placeholder="Example: EC-20260930-16"

                                value={reference}

                                onChange={(e) =>
                                    setReference(
                                        e.target.value.toUpperCase()
                                    )
                                }

                            />

                        </div>


                        {/* PHONE */}

                        <div className="reference-input-wrapper">

                            <label>
                                PHONE NUMBER
                            </label>


                            <input

                                type="tel"

                                placeholder="Example: 0821234567"

                                value={phone}

                                onChange={(e) =>
                                    setPhone(
                                        e.target.value
                                    )
                                }

                            />

                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                        >

                            {loading
                                ? "VERIFYING..."
                                : "CHECK BOOKING"}

                        </button>

                    </form>


                    <p className="reference-help">

                        Use the same phone number
                        that you entered when making
                        your booking.

                    </p>

                </div>


                {/* ======================================
                    ERROR
                ====================================== */}

                {error && (

                    <div className="booking-status-error">

                        <span className="error-icon">
                            !
                        </span>


                        <div>

                            <strong>
                                Something went wrong
                            </strong>


                            <p>
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* ======================================
                    SUCCESS
                ====================================== */}

                {success && (

                    <div className="booking-status-success">

                        <span className="success-icon">
                            ✓
                        </span>


                        <div>

                            <strong>
                                Booking Updated
                            </strong>


                            <p>
                                {success}
                            </p>

                        </div>

                    </div>

                )}


                {/* ======================================
                    BOOKING RESULT
                ====================================== */}

                {booking && (

                    <div className="booking-result">


                        {/* HEADER */}

                        <div className="booking-result-header">

                            <div>

                                <span className="result-label">
                                    BOOKING REFERENCE
                                </span>


                                <h3>

                                    {
                                        booking.reference ||
                                        booking.booking_reference ||
                                        booking.id ||
                                        "—"
                                    }

                                </h3>

                            </div>


                            <div
                                className={`booking-status-badge ${getStatusClass()}`}
                            >

                                <span className="status-dot"></span>

                                {getStatus()}

                            </div>

                        </div>


                        {/* STATUS MESSAGE */}

                        <div
                            className={`booking-status-message ${getStatusClass()}`}
                        >

                            <div className="status-message-icon">

                                {getStatus() === "CONFIRMED" &&
                                    "✓"}

                                {getStatus() === "COMPLETED" &&
                                    "✓"}

                                {getStatus() === "CANCELLED" &&
                                    "×"}

                                {getStatus() === "PENDING" &&
                                    "⏳"}

                            </div>


                            <div>

                                <strong>
                                    {getStatus()}
                                </strong>


                                <p>
                                    {getStatusMessage()}
                                </p>

                            </div>

                        </div>


                        {/* ======================================
                            PROGRESS
                        ====================================== */}

                        {getStatus() !== "CANCELLED" && (

                            <div className="booking-progress">


                                <div
                                    className={`progress-step ${
                                        [
                                            "PENDING",
                                            "CONFIRMED",
                                            "COMPLETED"
                                        ].includes(
                                            getStatus()
                                        )
                                            ? "active"
                                            : ""
                                    }`}
                                >

                                    <div className="progress-circle">
                                        ✓
                                    </div>

                                    <span>
                                        Booking Received
                                    </span>

                                </div>


                                <div
                                    className={`progress-line ${
                                        [
                                            "CONFIRMED",
                                            "COMPLETED"
                                        ].includes(
                                            getStatus()
                                        )
                                            ? "active"
                                            : ""
                                    }`}
                                ></div>


                                <div
                                    className={`progress-step ${
                                        [
                                            "CONFIRMED",
                                            "COMPLETED"
                                        ].includes(
                                            getStatus()
                                        )
                                            ? "active"
                                            : ""
                                    }`}
                                >

                                    <div className="progress-circle">
                                        ✓
                                    </div>

                                    <span>
                                        Confirmed
                                    </span>

                                </div>


                                <div
                                    className={`progress-line ${
                                        getStatus() ===
                                        "COMPLETED"
                                            ? "active"
                                            : ""
                                    }`}
                                ></div>


                                <div
                                    className={`progress-step ${
                                        getStatus() ===
                                        "COMPLETED"
                                            ? "active"
                                            : ""
                                    }`}
                                >

                                    <div className="progress-circle">
                                        ✓
                                    </div>

                                    <span>
                                        Completed
                                    </span>

                                </div>

                            </div>

                        )}


                        {/* ======================================
                            APPOINTMENT DETAILS
                        ====================================== */}

                        <div className="booking-details-section">

                            <div className="details-title">

                                <span></span>

                                <h4>
                                    APPOINTMENT DETAILS
                                </h4>

                                <span></span>

                            </div>


                            <div className="booking-details">


                                <div className="booking-detail">

                                    <span>
                                        CUSTOMER
                                    </span>

                                    <strong>

                                        {
                                            booking.customer ||
                                            booking.customer_name ||
                                            "—"
                                        }

                                    </strong>

                                </div>


                                <div className="booking-detail">

                                    <span>
                                        SERVICE
                                    </span>

                                    <strong>

                                        {
                                            booking.service ||
                                            "—"
                                        }

                                    </strong>

                                </div>


                                <div className="booking-detail">

                                    <span>
                                        BARBER
                                    </span>

                                    <strong>

                                        ✂️{" "}

                                        {
                                            booking.barber ||
                                            "—"
                                        }

                                    </strong>

                                </div>


                                <div className="booking-detail">

                                    <span>
                                        DATE
                                    </span>

                                    <strong>

                                        {
                                            formatDate(
                                                booking.date ||
                                                booking.booking_date
                                            )
                                        }

                                    </strong>

                                </div>


                                <div className="booking-detail">

                                    <span>
                                        TIME
                                    </span>

                                    <strong>

                                        {
                                            booking.time ||
                                            booking.booking_time ||
                                            "—"
                                        }

                                    </strong>

                                </div>


                                <div className="booking-detail">

                                    <span>
                                        PRICE
                                    </span>

                                    <strong className="booking-price">

                                        R
                                        {Number(
                                            booking.price || 0
                                        ).toFixed(2)}

                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* ======================================
                            CUSTOMER CANCELLATION
                        ====================================== */}

                        {(getStatus() === "PENDING" ||
                            getStatus() === "CONFIRMED") && (

                            <div className="customer-cancel-section">

                                <div>

                                    <strong>
                                        Need to cancel?
                                    </strong>

                                    <p>
                                        You can cancel your
                                        appointment using
                                        the button below.
                                    </p>

                                </div>


                                <button
                                    className="customer-cancel-button"
                                    onClick={cancelBooking}
                                    disabled={cancelling}
                                >

                                    {cancelling
                                        ? "CANCELLING..."
                                        : "CANCEL BOOKING"}

                                </button>

                            </div>

                        )}


                        {/* ======================================
                            FINAL STATUS
                        ====================================== */}

                        <div className="final-booking-status">

                            <span>
                                CURRENT STATUS
                            </span>


                            <strong
                                className={getStatusClass()}
                            >
                                {getStatus()}
                            </strong>

                        </div>


                    </div>

                )}

            </div>

        </section>

    );

}


export default BookingStatus;