import { useEffect, useState } from "react";

function WorkingHours() {

    const defaultHours = [
        {
            id: 1,
            day_name: "Monday",
            is_open: true,
            open_time: "09:00",
            close_time: "17:00"
        },
        {
            id: 2,
            day_name: "Tuesday",
            is_open: true,
            open_time: "09:00",
            close_time: "17:00"
        },
        {
            id: 3,
            day_name: "Wednesday",
            is_open: true,
            open_time: "09:00",
            close_time: "17:00"
        },
        {
            id: 4,
            day_name: "Thursday",
            is_open: true,
            open_time: "09:00",
            close_time: "17:00"
        },
        {
            id: 5,
            day_name: "Friday",
            is_open: true,
            open_time: "09:00",
            close_time: "18:00"
        },
        {
            id: 6,
            day_name: "Saturday",
            is_open: true,
            open_time: "09:00",
            close_time: "15:00"
        },
        {
            id: 7,
            day_name: "Sunday",
            is_open: false,
            open_time: "",
            close_time: ""
        }
    ];


    const [hours, setHours] =
        useState(defaultHours);

    const [loading, setLoading] =
        useState(true);

    const [savingId, setSavingId] =
        useState(null);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    // ==========================================
    // LOAD WORKING HOURS
    // ==========================================

    const loadHours = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/working-hours"
            );


            if (!response.ok) {

                throw new Error(
                    "Could not load working hours."
                );

            }


            const data =
                await response.json();


            console.log(
                "Working hours received:",
                data
            );


            if (
                Array.isArray(data) &&
                data.length > 0
            ) {

                const formattedData =
                    data.map((day) => ({

                        id: day.id,

                        day_name:
                            day.day_name,

                        is_open:
                            Number(day.is_open) === 1 ||
                            day.is_open === true,

                        open_time:
                            day.open_time
                                ? String(
                                    day.open_time
                                ).substring(0, 5)
                                : "",

                        close_time:
                            day.close_time
                                ? String(
                                    day.close_time
                                ).substring(0, 5)
                                : ""

                    }));


                setHours(formattedData);

            } else {

                console.log(
                    "No working hours returned. Using defaults."
                );

                setHours(defaultHours);

            }

        } catch (error) {

            console.error(
                "Working hours error:",
                error
            );

            setError(
                "Unable to connect to working hours. Showing default shop hours."
            );

            setHours(defaultHours);

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadHours();

    }, []);


    // ==========================================
    // CHANGE TIME
    // ==========================================

    const handleChange = (
        id,
        field,
        value
    ) => {

        setHours((previousHours) =>
            previousHours.map((day) =>

                day.id === id
                    ? {
                        ...day,
                        [field]: value
                    }
                    : day

            )
        );

        setMessage("");
        setError("");

    };


    // ==========================================
    // OPEN / CLOSED
    // ==========================================

    const toggleDay = (id) => {

        setHours((previousHours) =>
            previousHours.map((day) =>

                day.id === id
                    ? {
                        ...day,
                        is_open:
                            !day.is_open
                    }
                    : day

            )
        );

        setMessage("");
        setError("");

    };


    // ==========================================
    // SAVE DAY
    // ==========================================

    const saveDay = async (day) => {

        setMessage("");
        setError("");

        setSavingId(day.id);


        try {

            const response = await fetch(
                `http://localhost:5000/api/working-hours/${day.id}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        is_open:
                            day.is_open,

                        open_time:
                            day.open_time,

                        close_time:
                            day.close_time

                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to save working hours."
                );

            }


            setMessage(
                `${day.day_name} hours saved successfully!`
            );


            await loadHours();


        } catch (error) {

            console.error(
                "Save hours error:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setSavingId(null);

        }

    };


    // ==========================================
    // DISPLAY
    // ==========================================

    return (

        <section className="working-hours">

            <div className="working-hours-header">

                <p className="section-label">
                    SHOP SETTINGS
                </p>

                <h2>
                    Working Hours
                </h2>

                <p>
                    Set the days and times when
                    customers can book appointments.
                </p>

            </div>


            {message && (

                <div className="success-message">
                    {message}
                </div>

            )}


            {error && (

                <div className="error-message">
                    {error}
                </div>

            )}


            <div className="working-hours-card">

                {loading ? (

                    <div className="hours-loading">
                        Loading working hours...
                    </div>

                ) : (

                    <div className="hours-list">

                        {hours.map((day) => (

                            <div
                                className="hours-row"
                                key={day.id}
                            >

                                {/* DAY */}

                                <div className="day-name">

                                    <strong>
                                        {day.day_name}
                                    </strong>

                                </div>


                                {/* OPEN / CLOSED */}

                                <div className="day-status">

                                    <button
                                        type="button"
                                        className={
                                            day.is_open
                                                ? "open-toggle open"
                                                : "open-toggle closed"
                                        }
                                        onClick={() =>
                                            toggleDay(
                                                day.id
                                            )
                                        }
                                    >

                                        {day.is_open
                                            ? "Open"
                                            : "Closed"}

                                    </button>

                                </div>


                                {/* TIMES */}

                                {day.is_open ? (

                                    <>

                                        <div className="time-input">

                                            <label>
                                                Opens
                                            </label>

                                            <input
                                                type="time"
                                                value={
                                                    day.open_time
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        day.id,
                                                        "open_time",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </div>


                                        <div className="time-input">

                                            <label>
                                                Closes
                                            </label>

                                            <input
                                                type="time"
                                                value={
                                                    day.close_time
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        day.id,
                                                        "close_time",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </div>

                                    </>

                                ) : (

                                    <div className="closed-text">
                                        Shop closed
                                    </div>

                                )}


                                {/* SAVE */}

                                <button
                                    type="button"
                                    className="save-hours-button"
                                    onClick={() =>
                                        saveDay(day)
                                    }
                                    disabled={
                                        savingId ===
                                        day.id
                                    }
                                >

                                    {savingId === day.id
                                        ? "Saving..."
                                        : "Save"}

                                </button>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </section>

    );

}

export default WorkingHours;