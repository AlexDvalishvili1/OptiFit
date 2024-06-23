export const fetchActiveWorkout = async () => {
    try {
        const API_BASE_URL = typeof window !== "undefined" ? window.location.origin : '';
        const response = await fetch(`${API_BASE_URL}/api/workout/get/active`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        return await response.json();
    } catch (err) {
        console.error("Error fetching active workout:", err);
        return { error: "Failed to fetch active workout" };
    }
};

export const fetchPlannedWorkout = async () => {
    try {
        const API_BASE_URL = typeof window !== "undefined" ? window.location.origin : '';
        const response = await fetch(`${API_BASE_URL}/api/workout/plan/get`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        return await response.json();
    } catch (err) {
        console.error("Error fetching planned workout:", err);
        return { error: "Failed to fetch planned workout" };
    }
};

export const startWorkoutRequest = async (confirmation) => {
    try {
        const API_BASE_URL = typeof window !== "undefined" ? window.location.origin : '';
        const response = await fetch(`${API_BASE_URL}/api/workout/start`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ day: confirmation }),
        });
        return await response.json();
    } catch (err) {
        console.error("Error starting workout:", err);
        return { error: "Failed to start workout" };
    }
};

export const endWorkoutRequest = async (timer, day) => {
    try {
        const API_BASE_URL = typeof window !== "undefined" ? window.location.origin : '';
        const response = await fetch(`${API_BASE_URL}/api/workout/end`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ timer, day }),
        });
        return await response.json();
    } catch (err) {
        console.error("Error ending workout:", err);
        return { error: "Failed to end workout" };
    }
};
