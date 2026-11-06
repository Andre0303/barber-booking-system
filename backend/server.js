const express = require("express");
const cors = require("cors");

const db = require("./db");

const app = express();
const PORT = 5000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {

    res.json({
        message: "Elite Cuts backend is running!"
    });

});


// ==========================================
// TEST MYSQL CONNECTION
// ==========================================

app.get("/api/test-db", (req, res) => {

    db.query(
        "SELECT 1 AS result",
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    message:
                        "Database connection failed",
                    error:
                        err.message
                });

            }

            res.json({
                message:
                    "Database connection successful!",
                result:
                    results
            });

        }
    );

});


// ==========================================
// TEST ADMIN USER
// ==========================================

app.get("/api/test-user", (req, res) => {

    const sql = `
        SELECT
            id,
            username,
            password,
            role
        FROM users
        WHERE username = 'admin'
    `;


    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.log(
                    "User test error:",
                    err.message
                );

                return res.status(500).json({
                    message:
                        "Database query failed",
                    error:
                        err.message
                });

            }

            res.json({
                message:
                    "User found",
                users:
                    results
            });

        }
    );

});


// ==========================================
// ADMIN LOGIN
// ==========================================

app.post("/api/login", (req, res) => {

    const {
        username,
        password
    } = req.body;


    console.log(
        "Login attempt:"
    );

    console.log(
        "Username:",
        username
    );


    if (!username || !password) {

        return res.status(400).json({
            message:
                "Please enter username and password."
        });

    }


    const sql = `
        SELECT
            id,
            username,
            password,
            role
        FROM users
        WHERE username = ?
    `;


    db.query(
        sql,
        [username],
        (err, results) => {

            if (err) {

                console.log(
                    "Login database error:",
                    err.message
                );

                return res.status(500).json({
                    message:
                        "Database error.",
                    error:
                        err.message
                });

            }


            if (results.length === 0) {

                return res.status(401).json({
                    message:
                        "Username not found."
                });

            }


            const user =
                results[0];


            if (
                user.password !==
                password
            ) {

                return res.status(401).json({
                    message:
                        "Incorrect password."
                });

            }


            res.json({

                message:
                    "Login successful!",

                user: {

                    id:
                        user.id,

                    username:
                        user.username,

                    role:
                        user.role

                }

            });

        }
    );

});


// ==========================================
// GET ALL BARBERS
// ==========================================

app.get("/api/barbers", (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            phone,
            status
        FROM barbers
        ORDER BY name ASC
    `;


    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.log(
                    "Error getting barbers:",
                    err.message
                );

                return res.status(500).json({
                    message:
                        "Failed to get barbers.",
                    error:
                        err.message
                });

            }

            res.json(results);

        }
    );

});


// ==========================================
// UPDATE BARBER STATUS
// ==========================================

app.patch(
    "/api/barbers/:id/status",
    (req, res) => {

        const barberId =
            req.params.id;

        const {
            status
        } = req.body;


        const allowedStatuses = [
            "Available",
            "Unavailable"
        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({
                message:
                    "Invalid barber status."
            });

        }


        const sql = `
            UPDATE barbers
            SET status = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                status,
                barberId
            ],
            (err, result) => {

                if (err) {

                    console.log(
                        "Update barber error:",
                        err.message
                    );

                    return res.status(500).json({
                        message:
                            "Failed to update barber.",
                        error:
                            err.message
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Barber not found."
                    });

                }


                res.json({
                    message:
                        "Barber status updated successfully!"
                });

            }
        );

    }
);


// ==========================================
// DELETE BARBER
// ==========================================

app.delete(
    "/api/barbers/:id",
    (req, res) => {

        const barberId =
            req.params.id;


        const checkSql = `
            SELECT id
            FROM bookings
            WHERE barber = (
                SELECT name
                FROM barbers
                WHERE id = ?
            )
            AND status != 'Cancelled'
            LIMIT 1
        `;


        db.query(
            checkSql,
            [barberId],
            (
                checkError,
                bookings
            ) => {

                if (checkError) {

                    console.log(
                        "Check barber bookings error:",
                        checkError.message
                    );

                    return res.status(500).json({
                        message:
                            "Could not check barber bookings.",
                        error:
                            checkError.message
                    });

                }


                if (
                    bookings.length > 0
                ) {

                    return res.status(409).json({
                        message:
                            "This barber cannot be deleted because they have existing bookings. Set the barber to Unavailable instead."
                    });

                }


                const deleteSql = `
                    DELETE FROM barbers
                    WHERE id = ?
                `;


                db.query(
                    deleteSql,
                    [barberId],
                    (err, result) => {

                        if (err) {

                            console.log(
                                "Delete barber error:",
                                err.message
                            );

                            return res.status(500).json({
                                message:
                                    "Failed to delete barber.",
                                error:
                                    err.message
                            });

                        }


                        if (
                            result.affectedRows === 0
                        ) {

                            return res.status(404).json({
                                message:
                                    "Barber not found."
                            });

                        }


                        res.json({
                            message:
                                "Barber deleted successfully!"
                        });

                    }
                );

            }
        );

    }
);


// ==========================================
// GET WORKING HOURS
// ==========================================

app.get(
    "/api/working-hours",
    (req, res) => {

        const sql = `
            SELECT
                id,
                day_name,
                is_open,
                TIME_FORMAT(
                    open_time,
                    '%H:%i'
                ) AS open_time,
                TIME_FORMAT(
                    close_time,
                    '%H:%i'
                ) AS close_time
            FROM working_hours
            ORDER BY id ASC
        `;


        db.query(
            sql,
            (err, results) => {

                if (err) {

                    console.log(
                        "Error getting working hours:",
                        err.message
                    );

                    return res.status(500).json({
                        message:
                            "Failed to get working hours.",
                        error:
                            err.message
                    });

                }

                res.json(results);

            }
        );

    }
);


// ==========================================
// UPDATE WORKING HOURS
// ==========================================

app.patch(
    "/api/working-hours/:id",
    (req, res) => {

        const id =
            req.params.id;


        const {
            is_open,
            open_time,
            close_time
        } = req.body;


        // ======================================
        // SHOP CLOSED
        // ======================================

        if (!is_open) {

            const sql = `
                UPDATE working_hours
                SET
                    is_open = FALSE,
                    open_time = NULL,
                    close_time = NULL
                WHERE id = ?
            `;


            db.query(
                sql,
                [id],
                (err, result) => {

                    if (err) {

                        console.log(
                            "Update working hours error:",
                            err.message
                        );

                        return res.status(500).json({
                            message:
                                "Failed to update working hours.",
                            error:
                                err.message
                        });

                    }


                    if (
                        result.affectedRows === 0
                    ) {

                        return res.status(404).json({
                            message:
                                "Working hours record not found."
                        });

                    }


                    res.json({
                        message:
                            "Working hours updated successfully!"
                    });

                }
            );

            return;

        }


        // ======================================
        // SHOP OPEN
        // ======================================

        if (
            !open_time ||
            !close_time
        ) {

            return res.status(400).json({
                message:
                    "Opening and closing times are required."
            });

        }


        if (
            open_time >=
            close_time
        ) {

            return res.status(400).json({
                message:
                    "Closing time must be later than opening time."
            });

        }


        const sql = `
            UPDATE working_hours
            SET
                is_open = TRUE,
                open_time = ?,
                close_time = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                open_time,
                close_time,
                id
            ],
            (err, result) => {

                if (err) {

                    console.log(
                        "Update working hours error:",
                        err.message
                    );

                    return res.status(500).json({
                        message:
                            "Failed to update working hours.",
                        error:
                            err.message
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Working hours record not found."
                    });

                }


                res.json({
                    message:
                        "Working hours updated successfully!"
                });

            }
        );

    }
);


// ==========================================
// CREATE BOOKING
// ==========================================

app.post(
    "/api/bookings",
    (req, res) => {

        const {
            customer,
            phone,
            service,
            barber,
            date,
            time,
            price
        } = req.body;


        // ======================================
        // REQUIRED INFORMATION
        // ======================================

        if (
            !customer ||
            !phone ||
            !service ||
            !barber ||
            !date ||
            !time
        ) {

            return res.status(400).json({
                message:
                    "Please provide all required booking information."
            });

        }


        // ======================================
        // CHECK BARBER
        // ======================================

        const barberSql = `
            SELECT
                id,
                name,
                status
            FROM barbers
            WHERE name = ?
            LIMIT 1
        `;


        db.query(
            barberSql,
            [barber],
            (
                barberError,
                barberResults
            ) => {

                if (barberError) {

                    console.log(
                        "Barber check error:",
                        barberError.message
                    );

                    return res.status(500).json({
                        message:
                            "Could not verify barber.",
                        error:
                            barberError.message
                    });

                }


                if (
                    barberResults.length === 0
                ) {

                    return res.status(400).json({
                        message:
                            "The selected barber does not exist."
                    });

                }


                const selectedBarber =
                    barberResults[0];


                // ==================================
                // CHECK BARBER AVAILABILITY
                // ==================================

                if (
                    selectedBarber.status !==
                    "Available"
                ) {

                    return res.status(400).json({
                        message:
                            `${barber} is currently unavailable. Please choose another barber.`
                    });

                }


                // ==================================
                // GET DAY
                // ==================================

                const bookingDate =
                    new Date(
                        `${date}T00:00:00`
                    );


                if (
                    isNaN(
                        bookingDate.getTime()
                    )
                ) {

                    return res.status(400).json({
                        message:
                            "Invalid booking date."
                    });

                }


                const dayName =
                    bookingDate.toLocaleDateString(
                        "en-US",
                        {
                            weekday: "long"
                        }
                    );


                // ==================================
                // CHECK WORKING HOURS
                // ==================================

                const hoursSql = `
                    SELECT
                        id,
                        day_name,
                        is_open,
                        TIME_FORMAT(
                            open_time,
                            '%H:%i'
                        ) AS open_time,
                        TIME_FORMAT(
                            close_time,
                            '%H:%i'
                        ) AS close_time
                    FROM working_hours
                    WHERE day_name = ?
                    LIMIT 1
                `;


                db.query(
                    hoursSql,
                    [dayName],
                    (
                        hoursError,
                        hoursResults
                    ) => {

                        if (hoursError) {

                            console.log(
                                "Working hours check error:",
                                hoursError.message
                            );

                            return res.status(500).json({
                                message:
                                    "Could not verify shop hours.",
                                error:
                                    hoursError.message
                            });

                        }


                        if (
                            hoursResults.length === 0
                        ) {

                            return res.status(400).json({
                                message:
                                    `Working hours for ${dayName} have not been configured.`
                            });

                        }


                        const shopHours =
                            hoursResults[0];


                        // ==================================
                        // CHECK SHOP OPEN
                        // ==================================

                        if (
                            Number(
                                shopHours.is_open
                            ) !== 1
                        ) {

                            return res.status(400).json({
                                message:
                                    `The shop is closed on ${dayName}. Please select another date.`
                            });

                        }


                        if (
                            !shopHours.open_time ||
                            !shopHours.close_time
                        ) {

                            return res.status(400).json({
                                message:
                                    `No booking hours are configured for ${dayName}.`
                            });

                        }


                        const selectedTime =
                            String(time)
                                .substring(0, 5);

                        const openingTime =
                            String(
                                shopHours.open_time
                            ).substring(0, 5);

                        const closingTime =
                            String(
                                shopHours.close_time
                            ).substring(0, 5);


                        // ==================================
                        // CHECK TIME
                        // ==================================

                        if (
                            selectedTime <
                                openingTime ||
                            selectedTime >=
                                closingTime
                        ) {

                            return res.status(400).json({
                                message:
                                    `The selected time is outside the shop's opening hours. Shop hours on ${dayName} are ${openingTime} to ${closingTime}.`
                            });

                        }


                        // ==================================
                        // CHECK 30-MINUTE SLOT
                        // ==================================

                        const [
                            selectedHour,
                            selectedMinute
                        ] =
                            selectedTime
                                .split(":")
                                .map(Number);


                        if (
                            isNaN(
                                selectedHour
                            ) ||
                            isNaN(
                                selectedMinute
                            )
                        ) {

                            return res.status(400).json({
                                message:
                                    "Invalid booking time."
                            });

                        }


                        if (
                            selectedMinute !== 0 &&
                            selectedMinute !== 30
                        ) {

                            return res.status(400).json({
                                message:
                                    "Bookings must be made in 30-minute time slots."
                            });

                        }


                        // ==================================
                        // CHECK DOUBLE BOOKING
                        // ==================================

                        const bookingCheckSql = `
                            SELECT id
                            FROM bookings
                            WHERE barber = ?
                            AND booking_date = ?
                            AND booking_time = ?
                            AND status != 'Cancelled'
                            LIMIT 1
                        `;


                        db.query(
                            bookingCheckSql,
                            [
                                barber,
                                date,
                                selectedTime
                            ],
                            (
                                bookingCheckError,
                                existingBookings
                            ) => {

                                if (
                                    bookingCheckError
                                ) {

                                    console.log(
                                        "Booking check error:",
                                        bookingCheckError.message
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Could not check booking availability.",
                                        error:
                                            bookingCheckError.message
                                    });

                                }


                                if (
                                    existingBookings.length > 0
                                ) {

                                    return res.status(409).json({
                                        message:
                                            `${barber} is already booked for ${date} at ${selectedTime}. Please choose another time.`
                                    });

                                }


                                // ==================================
                                // INSERT BOOKING
                                // ==================================

                                const insertSql = `
                                    INSERT INTO bookings
                                    (
                                        customer_name,
                                        phone,
                                        service,
                                        barber,
                                        booking_date,
                                        booking_time,
                                        price,
                                        status
                                    )
                                    VALUES
                                    (
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        ?,
                                        'Pending'
                                    )
                                `;


                                db.query(
                                    insertSql,
                                    [
                                        customer,
                                        phone,
                                        service,
                                        barber,
                                        date,
                                        selectedTime,
                                        price || 0
                                    ],
                                    (
                                        insertError,
                                        result
                                    ) => {

                                        if (
                                            insertError
                                        ) {

                                            console.log(
                                                "Create booking error:",
                                                insertError.message
                                            );

                                            return res.status(500).json({
                                                message:
                                                    "Failed to create booking.",
                                                error:
                                                    insertError.message
                                            });

                                        }


                                        // ==================================
                                        // CREATE REFERENCE
                                        // ==================================

                                        const bookingReference =
                                            `EC-${date.replace(
                                                /-/g,
                                                ""
                                            )}-${result.insertId}`;


                                        // ==================================
                                        // RETURN BOOKING
                                        // ==================================

                                        res.status(201).json({

                                            message:
                                                "Booking created successfully!",

                                            booking: {

                                                id:
                                                    result.insertId,

                                                reference:
                                                    bookingReference,

                                                customer,

                                                phone,

                                                service,

                                                barber,

                                                date,

                                                time:
                                                    selectedTime,

                                                price:
                                                    price || 0,

                                                status:
                                                    "Pending"

                                            }

                                        });

                                    }
                                );

                            }
                        );

                    }
                );

            }
        );

    }
);


// ==========================================
// GET ALL BOOKINGS
// ==========================================

app.get(
    "/api/bookings",
    (req, res) => {

        const sql = `
            SELECT
                id,
                CONCAT(
                    'EC-',
                    DATE_FORMAT(
                        booking_date,
                        '%Y%m%d'
                    ),
                    '-',
                    id
                ) AS reference,
                customer_name AS customer,
                phone,
                service,
                barber,
                booking_date AS date,
                booking_time AS time,
                price,
                status,
                created_at
            FROM bookings
            ORDER BY
                booking_date ASC,
                booking_time ASC
        `;


        db.query(
            sql,
            (err, results) => {

                if (err) {

                    console.log(
                        "Error getting bookings:",
                        err.message
                    );

                    return res.status(500).json({
                        message:
                            "Failed to get bookings.",
                        error:
                            err.message
                    });

                }


                res.json(results);

            }
        );

    }
);


// ==========================================
// GET BOOKING BY REFERENCE
// ==========================================

app.get(
    "/api/bookings/reference/:reference",
    (req, res) => {

        const reference =
            req.params.reference
                .trim()
                .toUpperCase();


        console.log(
            "Booking reference search:",
            reference
        );


        /*
         * Expected reference:
         *
         * EC-20260930-15
         *
         * We extract:
         *
         * 20260930
         * and
         * 15
         */

        const referenceParts =
            reference.match(
                /^EC-(\d{8})-(\d+)$/
            );


        if (!referenceParts) {

            return res.status(400).json({
                message:
                    "Invalid booking reference. Please check your reference and try again."
            });

        }


        const bookingDate =
            referenceParts[1];

        const bookingId =
            referenceParts[2];


        const sql = `
            SELECT
                id,
                CONCAT(
                    'EC-',
                    DATE_FORMAT(
                        booking_date,
                        '%Y%m%d'
                    ),
                    '-',
                    id
                ) AS reference,
                customer_name AS customer,
                phone,
                service,
                barber,
                booking_date AS date,
                booking_time AS time,
                price,
                status,
                created_at
            FROM bookings
            WHERE id = ?
            AND DATE_FORMAT(
                booking_date,
                '%Y%m%d'
            ) = ?
            LIMIT 1
        `;


        db.query(
            sql,
            [
                bookingId,
                bookingDate
            ],
            (err, results) => {

                if (err) {

                    console.log(
                        "Booking reference search error:",
                        err.message
                    );

                    return res.status(500).json({
                        message:
                            "Could not search for booking.",
                        error:
                            err.message
                    });

                }


                if (
                    results.length === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Booking not found. Please check your booking reference."
                    });

                }


                res.json({

                    booking:
                        results[0]

                });

            }
        );

    }
);

// ======================================
// VERIFY BOOKING USING REFERENCE + PHONE
// ======================================

app.post(
    "/api/bookings/reference/:reference/verify",
    (req, res) => {

        const reference =
            req.params.reference
                .trim()
                .toUpperCase();


        const phone =
            String(
                req.body.phone || ""
            ).trim();


        console.log(
            "Verifying booking:",
            reference
        );


        // --------------------------------------
        // CHECK PHONE
        // --------------------------------------

        if (!phone) {

            return res.status(400).json({

                message:
                    "Please provide the phone number used for the booking."

            });

        }


        // --------------------------------------
        // CHECK REFERENCE FORMAT
        // --------------------------------------

        const referenceParts =
            reference.match(
                /^EC-(\d{8})-(\d+)$/
            );


        if (!referenceParts) {

            return res.status(400).json({

                message:
                    "Invalid booking reference."

            });

        }


        const bookingDate =
            referenceParts[1];


        const bookingId =
            referenceParts[2];


        // --------------------------------------
        // FIND BOOKING
        // --------------------------------------

        const sql = `

            SELECT

                id,

                CONCAT(
                    'EC-',
                    DATE_FORMAT(
                        booking_date,
                        '%Y%m%d'
                    ),
                    '-',
                    id
                ) AS reference,

                customer_name AS customer,

                phone,

                service,

                barber,

                booking_date AS date,

                booking_time AS time,

                price,

                status,

                created_at

            FROM bookings

            WHERE id = ?

            AND DATE_FORMAT(
                booking_date,
                '%Y%m%d'
            ) = ?

            LIMIT 1

        `;


        db.query(

            sql,

            [
                bookingId,
                bookingDate
            ],

            (err, results) => {

                if (err) {

                    console.log(
                        "Booking verification error:",
                        err.message
                    );


                    return res.status(500).json({

                        message:
                            "Could not verify booking.",

                        error:
                            err.message

                    });

                }


                // --------------------------------------
                // BOOKING NOT FOUND
                // --------------------------------------

                if (
                    results.length === 0
                ) {

                    return res.status(404).json({

                        message:
                            "Booking not found."

                    });

                }


                const booking =
                    results[0];


                // --------------------------------------
                // NORMALISE PHONE NUMBERS
                // --------------------------------------

                const storedPhone =
                    String(
                        booking.phone || ""
                    )
                        .replace(/\s+/g, "")
                        .replace(/-/g, "");


                const suppliedPhone =
                    phone
                        .replace(/\s+/g, "")
                        .replace(/-/g, "");


                // --------------------------------------
                // COMPARE PHONE NUMBERS
                // --------------------------------------

                if (
                    storedPhone !==
                    suppliedPhone
                ) {

                    return res.status(403).json({

                        message:
                            "The phone number does not match this booking."

                    });

                }


                // --------------------------------------
                // SUCCESS
                // --------------------------------------

                res.json({

                    message:
                        "Booking verified successfully.",

                    booking:
                        booking

                });

            }

        );

    }

);
// ==========================================
// UPDATE BOOKING STATUS
// ==========================================

app.patch(
    "/api/bookings/:id/status",
    (req, res) => {

        const bookingId =
            req.params.id;

        const {
            status
        } = req.body;


        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Completed",
            "Cancelled"
        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({
                message:
                    "Invalid booking status."
            });

        }


        const sql = `
            UPDATE bookings
            SET status = ?
            WHERE id = ?
        `;


        db.query(
            sql,
            [
                status,
                bookingId
            ],
            (err, result) => {

                if (err) {

                    console.log(
                        "Status update error:",
                        err.message
                    );

                    return res.status(500).json({
                        message:
                            "Failed to update booking.",
                        error:
                            err.message
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Booking not found."
                    });

                }


                res.json({
                    message:
                        "Booking status updated successfully!"
                });

            }
        );

    }
);

// ======================================
// CUSTOMER CANCEL BOOKING
// ======================================

// ======================================
// CUSTOMER CANCEL BOOKING
// REQUIRES REFERENCE + PHONE NUMBER
// ======================================

app.patch(
    "/api/bookings/reference/:reference/cancel",
    (req, res) => {

        const reference =
            req.params.reference
                .trim()
                .toUpperCase();


        const phone =
            String(
                req.body.phone || ""
            ).trim();


        console.log(
            "Customer cancelling booking:",
            reference
        );


        // --------------------------------------
        // CHECK PHONE
        // --------------------------------------

        if (!phone) {

            return res.status(400).json({

                message:
                    "Phone number is required to cancel this booking."

            });

        }


        // --------------------------------------
        // CHECK REFERENCE FORMAT
        // --------------------------------------

        const referenceParts =
            reference.match(
                /^EC-(\d{8})-(\d+)$/
            );


        if (!referenceParts) {

            return res.status(400).json({

                message:
                    "Invalid booking reference."

            });

        }


        const bookingDate =
            referenceParts[1];


        const bookingId =
            referenceParts[2];


        // --------------------------------------
        // FIND BOOKING
        // --------------------------------------

        const findSql = `

            SELECT

                id,

                phone,

                status,

                booking_date,

                booking_time

            FROM bookings

            WHERE id = ?

            AND DATE_FORMAT(
                booking_date,
                '%Y%m%d'
            ) = ?

            LIMIT 1

        `;


        db.query(

            findSql,

            [
                bookingId,
                bookingDate
            ],

            (err, results) => {

                if (err) {

                    console.log(
                        "Find booking error:",
                        err.message
                    );


                    return res.status(500).json({

                        message:
                            "Could not find booking.",

                        error:
                            err.message

                    });

                }


                // --------------------------------------
                // BOOKING DOES NOT EXIST
                // --------------------------------------

                if (
                    results.length === 0
                ) {

                    return res.status(404).json({

                        message:
                            "Booking not found."

                    });

                }


                const booking =
                    results[0];


                // --------------------------------------
                // NORMALISE PHONE NUMBERS
                // --------------------------------------

                const storedPhone =
                    String(
                        booking.phone || ""
                    )
                        .replace(/\s+/g, "")
                        .replace(/-/g, "");


                const suppliedPhone =
                    phone
                        .replace(/\s+/g, "")
                        .replace(/-/g, "");


                // --------------------------------------
                // VERIFY PHONE
                // --------------------------------------

                if (
                    storedPhone !==
                    suppliedPhone
                ) {

                    return res.status(403).json({

                        message:
                            "The phone number does not match this booking."

                    });

                }


                // --------------------------------------
                // GET CURRENT STATUS
                // --------------------------------------

                const currentStatus =
                    String(
                        booking.status ||
                        "Pending"
                    ).toUpperCase();


                // --------------------------------------
                // ALREADY CANCELLED
                // --------------------------------------

                if (
                    currentStatus ===
                    "CANCELLED"
                ) {

                    return res.status(400).json({

                        message:
                            "This booking has already been cancelled."

                    });

                }


                // --------------------------------------
                // COMPLETED BOOKINGS
                // CANNOT BE CANCELLED
                // --------------------------------------

                if (
                    currentStatus ===
                    "COMPLETED"
                ) {

                    return res.status(400).json({

                        message:
                            "A completed booking cannot be cancelled."

                    });

                }


                // --------------------------------------
                // CANCEL BOOKING
                // --------------------------------------

                const updateSql = `

                    UPDATE bookings

                    SET status = 'Cancelled'

                    WHERE id = ?

                `;


                db.query(

                    updateSql,

                    [bookingId],

                    (updateErr, updateResult) => {

                        if (updateErr) {

                            console.log(
                                "Cancel booking error:",
                                updateErr.message
                            );


                            return res.status(500).json({

                                message:
                                    "Could not cancel booking.",

                                error:
                                    updateErr.message

                            });

                        }


                        // --------------------------------------
                        // CHECK UPDATE
                        // --------------------------------------

                        if (
                            updateResult.affectedRows === 0
                        ) {

                            return res.status(404).json({

                                message:
                                    "Booking could not be cancelled."

                            });

                        }


                        // --------------------------------------
                        // SUCCESS
                        // --------------------------------------

                        res.json({

                            message:
                                "Booking cancelled successfully!",

                            reference:
                                reference,

                            status:
                                "Cancelled"

                        });

                    }

                );

            }

        );

    }

);


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    () => {

        console.log(
            "================================="
        );

        console.log(
            "ELITE CUTS BACKEND"
        );

        console.log(
            "================================="
        );

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    }
);