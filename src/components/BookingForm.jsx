import { useEffect, useState } from "react";

function BookingForm({ service, onBookingCreated }) {

    const [formData, setFormData] = useState({
        customer: "",
        phone: "",
        date: ""
    });

    const [barbers, setBarbers] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState("");

    const [bookings, setBookings] = useState([]);
    const [workingHours, setWorkingHours] = useState([]);

    const [loadingBarbers, setLoadingBarbers] = useState(true);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [loadingHours, setLoadingHours] = useState(true);

    const [selectedTime, setSelectedTime] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [confirmedBooking, setConfirmedBooking] =
        useState(null);

    const [bookingLoading, setBookingLoading] =
        useState(false);


    // ==========================================
    // LOAD AVAILABLE BARBERS
    // ==========================================

    useEffect(() => {

        fetch("http://localhost:5000/api/barbers")

            .then((response) => {

                if (!response.ok) {
                    throw new Error("Failed to load barbers");
                }

                return response.json();

            })

            .then((data) => {

                const availableBarbers =
                    data.filter(
                        (barber) =>
                            barber.status === "Available"
                    );

                setBarbers(availableBarbers);

                // Automatically select barber
                // if there is only one
                if (availableBarbers.length === 1) {

                    setSelectedBarber(
                        availableBarbers[0].id.toString()
                    );
                }

            })

            .catch((error) => {

                console.error(
                    "Error loading barbers:",
                    error
                );

                setError(
                    "Unable to load barbers."
                );

            })

            .finally(() => {

                setLoadingBarbers(false);

            });

    }, []);


    // ==========================================
    // LOAD WORKING HOURS
    // ==========================================

    useEffect(() => {

        fetch(
            "http://localhost:5000/api/working-hours"
        )

            .then((response) => {

                if (!response.ok) {
                    throw new Error(
                        "Failed to load working hours"
                    );
                }

                return response.json();

            })

            .then((data) => {

                console.log(
                    "Working hours:",
                    data
                );

                setWorkingHours(data);

            })

            .catch((error) => {

                console.error(
                    "Error loading working hours:",
                    error
                );

                setError(
                    "Unable to load shop hours."
                );

            })

            .finally(() => {

                setLoadingHours(false);

            });

    }, []);


    // ==========================================
    // LOAD EXISTING BOOKINGS
    // ==========================================

    useEffect(() => {

        if (
            !formData.date ||
            !selectedBarber
        ) {

            setBookings([]);

            return;
        }

        setLoadingBookings(true);

        fetch(
            "http://localhost:5000/api/bookings"
        )

            .then((response) => {

                if (!response.ok) {
                    throw new Error(
                        "Failed to load bookings"
                    );
                }

                return response.json();

            })

            .then((data) => {

                const barber =
                    barbers.find(
                        (item) =>
                            item.id.toString() ===
                            selectedBarber
                    );

                if (!barber) {
                    return;
                }

                const barberBookings =
                    data.filter(
                        (booking) =>
                            booking.barber ===
                                barber.name &&
                            booking.date ===
                                formData.date &&
                            booking.status !==
                                "Cancelled"
                    );

                setBookings(
                    barberBookings
                );

            })

            .catch((error) => {

                console.error(
                    "Error loading bookings:",
                    error
                );

            })

            .finally(() => {

                setLoadingBookings(false);

            });

    }, [
        formData.date,
        selectedBarber,
        barbers
    ]);


    // ==========================================
    // GET DAY NAME
    // ==========================================

    const getDayName = (dateString) => {

        if (!dateString) {
            return "";
        }

        const date = new Date(
            `${dateString}T00:00:00`
        );

        return date.toLocaleDateString(
            "en-US",
            {
                weekday: "long"
            }
        );
    };


    // ==========================================
    // GET HOURS FOR SELECTED DAY
    // ==========================================

    const getSelectedDayHours = () => {

        if (
            !formData.date ||
            workingHours.length === 0
        ) {
            return null;
        }

        const dayName =
            getDayName(formData.date);

        const dayHours =
            workingHours.find(
                (day) =>
                    day.day_name.toLowerCase() ===
                    dayName.toLowerCase()
            );

        return dayHours || null;
    };


    const selectedDayHours =
        getSelectedDayHours();


    // ==========================================
    // GENERATE TIME SLOTS
    // ==========================================

    const generateTimeSlots = () => {

        if (
            !selectedDayHours ||
            !selectedDayHours.is_open
        ) {
            return [];
        }

        if (
            !selectedDayHours.open_time ||
            !selectedDayHours.close_time
        ) {
            return [];
        }

        const slots = [];

        const openTime =
            String(
                selectedDayHours.open_time
            ).substring(0, 5);

        const closeTime =
            String(
                selectedDayHours.close_time
            ).substring(0, 5);

        let [openHour, openMinute] =
            openTime.split(":").map(Number);

        const [closeHour, closeMinute] =
            closeTime.split(":").map(Number);

        while (
            openHour < closeHour ||
            (
                openHour === closeHour &&
                openMinute < closeMinute
            )
        ) {

            const formattedHour =
                String(openHour).padStart(
                    2,
                    "0"
                );

            const formattedMinute =
                String(openMinute).padStart(
                    2,
                    "0"
                );

            slots.push(
                `${formattedHour}:${formattedMinute}`
            );

            openMinute += 30;

            if (openMinute >= 60) {

                openMinute = 0;
                openHour++;

            }
        }

        return slots;
    };


    const timeSlots =
        generateTimeSlots();


    // ==========================================
    // CHECK IF TIME IS BOOKED
    // ==========================================

    const isTimeBooked = (time) => {

        return bookings.some(
            (booking) => {

                const bookingTime =
                    String(
                        booking.time
                    ).substring(0, 5);

                return (
                    bookingTime === time
                );

            }
        );
    };


    // ==========================================
    // HANDLE INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        setMessage("");
        setError("");

        if (name === "date") {

            setSelectedTime("");

        }
    };


    // ==========================================
    // HANDLE BARBER CHANGE
    // ==========================================

    const handleBarberChange = (e) => {

        setSelectedBarber(
            e.target.value
        );

        setSelectedTime("");
        setMessage("");
        setError("");
    };


    // ==========================================
    // HANDLE BOOKING SUBMISSION
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        // --------------------------------------
        // CHECK SERVICE
        // --------------------------------------

        if (!service) {

            setError(
                "Please select a service before booking."
            );

            return;
        }


        // --------------------------------------
        // CHECK DATE
        // --------------------------------------

        if (!formData.date) {

            setError(
                "Please select a booking date."
            );

            return;
        }


        // --------------------------------------
        // CHECK SHOP HOURS
        // --------------------------------------

        if (!selectedDayHours) {

            setError(
                "Please select a valid booking date."
            );

            return;
        }


        if (!selectedDayHours.is_open) {

            setError(
                `The shop is closed on ${getDayName(
                    formData.date
                )}. Please select another date.`
            );

            return;
        }


        // --------------------------------------
        // CHECK TIME
        // --------------------------------------

        if (!selectedTime) {

            setError(
                "Please select an appointment time."
            );

            return;
        }


        // --------------------------------------
        // CHECK BARBER
        // --------------------------------------

        const barber =
            barbers.find(
                (item) =>
                    item.id.toString() ===
                    selectedBarber
            );

        if (!barber) {

            setError(
                "Please select a valid barber."
            );

            return;
        }


        // --------------------------------------
        // CHECK IF TIME IS ALREADY BOOKED
        // --------------------------------------

        if (isTimeBooked(selectedTime)) {

            setError(
                "This appointment time has already been booked. Please select another time."
            );

            return;
        }


        // --------------------------------------
        // START LOADING
        // --------------------------------------

        setBookingLoading(true);


        try {

            // ----------------------------------
            // SEND BOOKING TO BACKEND
            // ----------------------------------

            const response =
                await fetch(
                    "http://localhost:5000/api/bookings",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            customer:
                                formData.customer,

                            phone:
                                formData.phone,

                            service:
                                service.name,

                            barber:
                                barber.name,

                            date:
                                formData.date,

                            time:
                                selectedTime,

                            price:
                                service.price,

                            status:
                                "Pending"
                        })
                    }
                );


            // ----------------------------------
            // GET RESPONSE
            // ----------------------------------

            const data =
                await response.json();


            // ----------------------------------
            // CHECK RESPONSE
            // ----------------------------------

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Booking failed."
                );
            }


            // ----------------------------------
            // SAVE CONFIRMED BOOKING
            // ----------------------------------

            const booking =
                data.booking || data;


            setConfirmedBooking(
                booking
            );


            // ----------------------------------
            // NOTIFY PARENT COMPONENT
            // ----------------------------------

            if (onBookingCreated) {

                onBookingCreated(
                    data
                );
            }


            // ----------------------------------
            // CLEAR FORM
            // ----------------------------------

            setFormData({
                customer: "",
                phone: "",
                date: ""
            });

            setSelectedTime("");

            setBookings([]);


        } catch (error) {

            console.error(
                "Booking error:",
                error
            );

            setError(
                error.message ||
                "Something went wrong while creating the booking."
            );

        } finally {

            setBookingLoading(
                false
            );

        }
    };


    // ==========================================
    // DISPLAY
    // ==========================================

    return (

        <div className="booking-form-container">

            <div className="booking-form-card">

                {!confirmedBooking ? (

                    <>

                        {/* ==============================
                            BOOKING HEADER
                           ============================== */}

                        <div className="booking-header">

                            <p>
                                BOOK YOUR APPOINTMENT
                            </p>

                            <h2>
                                {service?.name ||
                                    "Select a Service"}
                            </h2>

                            {service && (

                                <span className="booking-price">
                                    R{service.price}
                                </span>

                            )}

                        </div>


                        {/* ==============================
                            BOOKING FORM
                           ============================== */}

                        <form onSubmit={handleSubmit}>


                            {/* NAME */}

                            <div className="form-group">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="customer"
                                    value={
                                        formData.customer
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your name"
                                    required
                                />

                            </div>


                            {/* PHONE */}

                            <div className="form-group">

                                <label>
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={
                                        formData.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your phone number"
                                    required
                                />

                            </div>


                            {/* BARBER */}

                            <div className="form-group">

                                <label>
                                    Barber
                                </label>


                                {loadingBarbers ? (

                                    <p>
                                        Loading barbers...
                                    </p>

                                ) : barbers.length === 0 ? (

                                    <p className="form-error">
                                        No barbers are currently
                                        available.
                                    </p>

                                ) : barbers.length === 1 ? (

                                    <div className="single-barber">

                                        <strong>
                                            ✂️{" "}
                                            {barbers[0].name}
                                        </strong>

                                        <span>
                                            Your barber
                                        </span>

                                    </div>

                                ) : (

                                    <select
                                        value={
                                            selectedBarber
                                        }
                                        onChange={
                                            handleBarberChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Choose a barber
                                        </option>

                                        {barbers.map(
                                            (barber) => (

                                                <option
                                                    key={
                                                        barber.id
                                                    }
                                                    value={
                                                        barber.id
                                                    }
                                                >
                                                    {
                                                        barber.name
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                )}

                            </div>


                            {/* DATE */}

                            <div className="form-group">

                                <label>
                                    Preferred Date
                                </label>

                                <input
                                    type="date"
                                    name="date"
                                    value={
                                        formData.date
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min={
                                        new Date()
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    required
                                />

                            </div>


                            {/* SHOP HOURS */}

                            {formData.date &&
                                !loadingHours && (

                                    <div className="shop-hours-info">

                                        {selectedDayHours ? (

                                            selectedDayHours.is_open ? (

                                                <p>

                                                    🟢 Shop open on{" "}

                                                    <strong>
                                                        {getDayName(
                                                            formData.date
                                                        )}
                                                    </strong>

                                                    {" "}from{" "}

                                                    <strong>
                                                        {
                                                            String(
                                                                selectedDayHours.open_time
                                                            ).substring(
                                                                0,
                                                                5
                                                            )
                                                        }
                                                    </strong>

                                                    {" "}to{" "}

                                                    <strong>
                                                        {
                                                            String(
                                                                selectedDayHours.close_time
                                                            ).substring(
                                                                0,
                                                                5
                                                            )
                                                        }
                                                    </strong>

                                                </p>

                                            ) : (

                                                <p className="shop-closed">

                                                    🔴 Shop is closed on{" "}

                                                    <strong>
                                                        {getDayName(
                                                            formData.date
                                                        )}
                                                    </strong>

                                                </p>

                                            )

                                        ) : (

                                            <p className="shop-closed">
                                                Unable to determine
                                                shop hours.
                                            </p>

                                        )}

                                    </div>

                                )}


                            {/* TIME SLOTS */}

                            {formData.date &&
                                selectedDayHours &&
                                selectedDayHours.is_open && (

                                    <div className="form-group">

                                        <label>
                                            Available Times
                                        </label>


                                        {loadingBookings ? (

                                            <p>
                                                Checking available
                                                times...
                                            </p>

                                        ) : timeSlots.length === 0 ? (

                                            <p className="form-error">
                                                No appointment times
                                                are available.
                                            </p>

                                        ) : (

                                            <div className="time-slots">

                                                {timeSlots.map(
                                                    (time) => {

                                                        const booked =
                                                            isTimeBooked(
                                                                time
                                                            );

                                                        return (

                                                            <button
                                                                type="button"
                                                                key={
                                                                    time
                                                                }
                                                                className={
                                                                    selectedTime ===
                                                                    time
                                                                        ? "time-slot selected"
                                                                        : booked
                                                                        ? "time-slot booked"
                                                                        : "time-slot"
                                                                }
                                                                disabled={
                                                                    booked
                                                                }
                                                                onClick={() =>
                                                                    setSelectedTime(
                                                                        time
                                                                    )
                                                                }
                                                            >

                                                                {time}

                                                            </button>

                                                        );

                                                    }
                                                )}

                                            </div>

                                        )}

                                    </div>

                                )}


                            {/* MESSAGE */}

                            {message && (

                                <div className="booking-message">
                                    {message}
                                </div>

                            )}


                            {/* ERROR */}

                            {error && (

                                <div className="booking-error">
                                    {error}
                                </div>

                            )}


                            {/* SUBMIT BUTTON */}

                            <button
                                type="submit"
                                className="booking-submit"
                                disabled={
                                    bookingLoading ||
                                    barbers.length === 0 ||
                                    (
                                        formData.date &&
                                        selectedDayHours &&
                                        !selectedDayHours.is_open
                                    )
                                }
                            >

                                {bookingLoading
                                    ? "Creating Booking..."
                                    : "Confirm Booking"}

                            </button>


                        </form>

                    </>

                ) : (

                    /* ==========================================
                       BOOKING CONFIRMATION
                       ========================================== */

                    <div className="booking-confirmation">


                        <div className="confirmation-icon">
                            ✓
                        </div>


                        <p className="confirmation-label">
                            BOOKING RECEIVED
                        </p>


                        <h2>
                            Booking Confirmed!
                        </h2>


                        <p className="confirmation-message">
                            Your appointment has been
                            successfully submitted.
                        </p>


                        {/* BOOKING REFERENCE */}

                        <div className="booking-reference">

                            <span>
                                BOOKING REFERENCE
                            </span>

                            <strong>
                                {
                                    confirmedBooking.reference ||
                                    confirmedBooking.id ||
                                    "Pending"
                                }
                            </strong>

                        </div>


                        {/* BOOKING DETAILS */}

                        <div className="confirmation-details">


                            <div className="confirmation-row">

                                <span>
                                    Service
                                </span>

                                <strong>
                                    {
                                        confirmedBooking.service
                                    }
                                </strong>

                            </div>


                            <div className="confirmation-row">

                                <span>
                                    Barber
                                </span>

                                <strong>
                                    ✂️{" "}
                                    {
                                        confirmedBooking.barber
                                    }
                                </strong>

                            </div>


                            <div className="confirmation-row">

                                <span>
                                    Date
                                </span>

                                <strong>
                                    {
                                        confirmedBooking.date
                                    }
                                </strong>

                            </div>


                            <div className="confirmation-row">

                                <span>
                                    Time
                                </span>

                                <strong>
                                    {
                                        confirmedBooking.time
                                    }
                                </strong>

                            </div>


                            <div className="confirmation-row">

                                <span>
                                    Price
                                </span>

                                <strong>
                                    R
                                    {
                                        confirmedBooking.price
                                    }
                                </strong>

                            </div>


                        </div>


                        {/* PENDING NOTICE */}

                        <div className="pending-notice">

                            <strong>
                                ⏳ Pending Confirmation
                            </strong>

                            <p>
                                Your booking has been sent
                                to the barbershop. The shop
                                will confirm your appointment.
                            </p>

                        </div>


                        {/* NEW BOOKING */}

                        <button
                            type="button"
                            className="new-booking-button"
                            onClick={() => {

                                setConfirmedBooking(
                                    null
                                );

                                setMessage("");
                                setError("");

                                setFormData({
                                    customer: "",
                                    phone: "",
                                    date: ""
                                });

                                setSelectedTime("");

                            }}
                        >

                            Make Another Booking

                        </button>


                    </div>

                )}

            </div>

        </div>

    );
}

export default BookingForm;

