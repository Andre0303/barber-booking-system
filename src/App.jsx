import { useEffect, useState } from "react";
import BookingStatus from "./components/BookingStatus";
import Services from "./components/Services";
import BookingForm from "./components/BookingForm";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
import "./App.css";

function App() {

    const [selectedService, setSelectedService] = useState(null);

    const [showAdmin, setShowAdmin] = useState(false);

    // Stores the logged-in admin
    const [adminUser, setAdminUser] = useState(null);

    // Stores all bookings
    const [bookings, setBookings] = useState([]);

    const [loadingBookings, setLoadingBookings] = useState(true);


    // ======================================
    // LOAD BOOKINGS FROM MYSQL
    // ======================================

    useEffect(() => {

        loadBookings();

    }, []);


    // ======================================
    // LOAD BOOKINGS FUNCTION
    // ======================================

    const loadBookings = async () => {

        try {

            setLoadingBookings(true);

            const response = await fetch(
                "http://localhost:5000/api/bookings"
            );

            if (!response.ok) {

                throw new Error(
                    "Failed to load bookings"
                );

            }

            const data = await response.json();

            console.log(
                "Bookings loaded:",
                data
            );


            /*
             * Handles both:
             *
             * [
             *     booking1,
             *     booking2
             * ]
             *
             * and:
             *
             * {
             *     bookings: [...]
             * }
             */

            const loadedBookings =
                Array.isArray(data)
                    ? data
                    : data.bookings || [];


            setBookings(loadedBookings);

        } catch (error) {

            console.error(
                "Error loading bookings:",
                error
            );

        } finally {

            setLoadingBookings(false);

        }

    };


    // ======================================
    // SELECT SERVICE
    // ======================================

    const handleBook = (service) => {

        setSelectedService(service);

        setTimeout(() => {

            document
                .getElementById("booking")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        }, 100);

    };


    // ======================================
    // NEW BOOKING
    // ======================================

    const handleBookingCreated = async (bookingData) => {

        console.log(
            "New booking received:",
            bookingData
        );


        /*
         * Backend may return:
         *
         * {
         *     booking: {...}
         * }
         *
         * OR:
         *
         * {...}
         */

        const newBooking =
            bookingData?.booking ||
            bookingData;


        if (!newBooking) {

            console.error(
                "No booking returned from backend."
            );

            return;

        }


        // Add the booking immediately

        setBookings((previousBookings) => {

            const bookingId =
                newBooking.id ||
                newBooking.booking_id ||
                newBooking.reference;


            const alreadyExists =
                previousBookings.some(
                    (booking) => {

                        const existingId =
                            booking.id ||
                            booking.booking_id ||
                            booking.reference;


                        return (
                            existingId &&
                            bookingId &&
                            String(existingId) ===
                            String(bookingId)
                        );

                    }
                );


            if (alreadyExists) {

                return previousBookings;

            }


            return [
                ...previousBookings,
                newBooking
            ];

        });


        /*
         * Reload bookings from MySQL.
         */

        await loadBookings();

    };


    // ======================================
    // UPDATE BOOKING STATUS
    // ======================================

    const handleBookingStatusUpdated = (
        bookingId,
        newStatus
    ) => {

        console.log(
            "Updating booking:",
            bookingId,
            "to:",
            newStatus
        );


        setBookings((previousBookings) => {

            return previousBookings.map(
                (booking) => {

                    const currentBookingId =
                        booking.id ||
                        booking.booking_id;


                    if (
                        String(currentBookingId) ===
                        String(bookingId)
                    ) {

                        return {
                            ...booking,
                            status: newStatus
                        };

                    }


                    return booking;

                }
            );

        });

    };


    // ======================================
    // CLOSE BOOKING
    // ======================================

    const closeBooking = () => {

        setSelectedService(null);

    };


    // ======================================
    // OPEN ADMIN LOGIN
    // ======================================

    const handleAdminClick = () => {

        setShowAdmin(true);

    };


    // ======================================
    // SUCCESSFUL ADMIN LOGIN
    // ======================================

    const handleAdminLogin = (user) => {

        console.log(
            "Admin logged in:",
            user
        );

        setAdminUser(user);

    };


    // ======================================
    // ADMIN LOGOUT
    // ======================================

    const handleAdminLogout = () => {

        setAdminUser(null);

        setShowAdmin(false);

    };


    // ======================================
    // ADMIN AREA
    // ======================================

    if (showAdmin) {


        // ----------------------------------
        // ADMIN NOT LOGGED IN
        // ----------------------------------

        if (!adminUser) {

            return (

                <AdminLogin
                    onLogin={handleAdminLogin}
                />

            );

        }


        // ----------------------------------
        // ADMIN LOGGED IN
        // ----------------------------------

        return (

            <AdminDashboard

                bookings={bookings}

                onBookingStatusUpdated={
                    handleBookingStatusUpdated
                }

                onBack={() =>
                    setShowAdmin(false)
                }

                onLogout={
                    handleAdminLogout
                }

            />

        );

    }


    // ======================================
    // MAIN WEBSITE
    // ======================================

    return (

        <div className="app">


            {/* ==================================
                NAVBAR
            ================================== */}

            <nav className="navbar">

                <div className="logo">

                    ELITE <span>CUTS</span>

                </div>


                <div className="nav-links">

                    <a href="#home">
                        Home
                    </a>

                    <a href="#services">
                        Services
                    </a>

                    <a href="#booking">
                        Book
                    </a>

                    <a href="#booking-status">
                        Check Booking
                    </a>


                    {/* ADMIN BUTTON */}

                    <button
                        className="admin-button"
                        onClick={
                            handleAdminClick
                        }
                    >
                        Admin
                    </button>

                </div>

            </nav>


            {/* ==================================
                HERO
            ================================== */}

            <section
                className="hero"
                id="home"
            >

                <div className="hero-content">

                    <p className="hero-small-title">
                        PREMIUM BARBERSHOP
                    </p>


                    <h1>

                        LOOK SHARP.

                        <br />

                        <span>
                            FEEL CONFIDENT.
                        </span>

                    </h1>


                    <p>

                        Professional cuts, fades and
                        grooming for men who take pride
                        in their look.

                    </p>


                    <a
                        href="#services"
                        className="hero-button"
                    >
                        View Services
                    </a>

                </div>

            </section>


            {/* ==================================
                SERVICES
            ================================== */}

            <section id="services">

                <Services
                    onBook={handleBook}
                />

            </section>


            {/* ==================================
                BOOKING
            ================================== */}

            {selectedService && (

                <section id="booking">

                    <BookingForm

                        service={selectedService}

                        onBookingCreated={
                            handleBookingCreated
                        }

                    />


                    <button
                        className="close-booking"
                        onClick={closeBooking}
                    >
                        Cancel Booking
                    </button>

                </section>

            )}


            {/* ==================================
                BOOKING STATUS
            ================================== */}

            <BookingStatus />


            {/* ==================================
                FOOTER
            ================================== */}

            <footer>

                <div className="logo">

                    ELITE <span>CUTS</span>

                </div>


                <p>
                    Premium grooming.
                    Professional service.
                </p>


                <p>
                    © 2026 Elite Cuts.
                    All rights reserved.
                </p>

            </footer>


        </div>

    );

}

export default App;