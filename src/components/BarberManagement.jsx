import { useEffect, useState } from "react";

function BarberManagement() {

    const [barbers, setBarbers] = useState([]);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    // ==========================
    // LOAD BARBERS
    // ==========================

    const loadBarbers = () => {

        fetch("http://localhost:5000/api/barbers")

            .then((response) => {

                if (!response.ok) {
                    throw new Error(
                        "Failed to load barbers."
                    );
                }

                return response.json();
            })

            .then((data) => {

                setBarbers(data);

            })

            .catch((error) => {

                console.error(error);

                setError(
                    "Unable to load barbers."
                );

            })

            .finally(() => {

                setLoading(false);

            });
    };


    useEffect(() => {

        loadBarbers();

    }, []);


    // ==========================
    // ADD BARBER
    // ==========================

    const handleAddBarber = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        if (!name.trim()) {

            setError(
                "Please enter the barber's name."
            );

            return;
        }


        try {

            const response = await fetch(
                "http://localhost:5000/api/barbers",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        phone: phone
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to add barber."
                );
            }


            setMessage(
                "Barber added successfully!"
            );


            setName("");
            setPhone("");

            loadBarbers();


        } catch (error) {

            console.error(error);

            setError(
                error.message
            );

        }
    };


    // ==========================
    // CHANGE STATUS
    // ==========================

    const changeStatus = async (
        barberId,
        currentStatus
    ) => {

        const newStatus =
            currentStatus === "Available"
                ? "Unavailable"
                : "Available";


        try {

            const response = await fetch(
                `http://localhost:5000/api/barbers/${barberId}/status`,
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
                    "Failed to update barber."
                );
            }


            loadBarbers();


        } catch (error) {

            console.error(error);

            setError(
                error.message
            );
        }
    };


    // ==========================
    // DELETE BARBER
    // ==========================

    const deleteBarber = async (barberId) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this barber?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const response = await fetch(
                `http://localhost:5000/api/barbers/${barberId}`,
                {
                    method: "DELETE"
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to delete barber."
                );
            }


            setMessage(
                "Barber deleted successfully!"
            );


            loadBarbers();


        } catch (error) {

            console.error(error);

            setError(
                error.message
            );
        }
    };


    return (

        <div className="barber-management">

            <div className="barber-management-header">

                <div>

                    <p className="section-label">
                        STAFF MANAGEMENT
                    </p>

                    <h2>
                        Manage Barbers
                    </h2>

                    <p>
                        Add and manage the barbers
                        working at your shop.
                    </p>

                </div>

            </div>


            {/* ADD BARBER */}

            <div className="add-barber-card">

                <h3>
                    Add New Barber
                </h3>

                <form
                    onSubmit={
                        handleAddBarber
                    }
                    className="add-barber-form"
                >

                    <div className="form-group">

                        <label>
                            Barber Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                            placeholder="Enter barber name"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Phone Number
                        </label>

                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) =>
                                setPhone(
                                    e.target.value
                                )
                            }
                            placeholder="Optional"
                        />

                    </div>


                    <button
                        type="submit"
                        className="add-barber-button"
                    >
                        + Add Barber
                    </button>

                </form>


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

            </div>


            {/* BARBER LIST */}

            <div className="barber-list-card">

                <div className="barber-list-header">

                    <h3>
                        Current Barbers
                    </h3>

                    <span>
                        {barbers.length} barber
                        {barbers.length !== 1
                            ? "s"
                            : ""}
                    </span>

                </div>


                {loading ? (

                    <p>
                        Loading barbers...
                    </p>

                ) : barbers.length === 0 ? (

                    <p className="no-barbers">
                        No barbers have been added yet.
                    </p>

                ) : (

                    <div className="barber-list">

                        {barbers.map(
                            (barber) => (

                                <div
                                    className="barber-item"
                                    key={
                                        barber.id
                                    }
                                >

                                    <div className="barber-info">

                                        <div className="barber-avatar">
                                            ✂️
                                        </div>

                                        <div>

                                            <strong>
                                                {
                                                    barber.name
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    barber.phone ||
                                                    "No phone number"
                                                }
                                            </span>

                                        </div>

                                    </div>


                                    <div className="barber-actions">

                                        <span
                                            className={
                                                barber.status ===
                                                "Available"
                                                    ? "status available"
                                                    : "status unavailable"
                                            }
                                        >
                                            {
                                                barber.status
                                            }
                                        </span>


                                        <button
                                            onClick={() =>
                                                changeStatus(
                                                    barber.id,
                                                    barber.status
                                                )
                                            }
                                            className="status-button"
                                        >
                                            {barber.status ===
                                            "Available"
                                                ? "Set Unavailable"
                                                : "Set Available"}
                                        </button>


                                        <button
                                            onClick={() =>
                                                deleteBarber(
                                                    barber.id
                                                )
                                            }
                                            className="delete-barber-button"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>
    );
}

export default BarberManagement;