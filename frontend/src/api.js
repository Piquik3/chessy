const API_URL = import.meta.env.VITE_API_URL;

async function request(url, options = {}) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && {
                Authorization: `Bearer ${token}`,
            }),
            ...(options.headers || {}),
        },
    });

    const json = await res.json();

    if (!res.ok) {
        throw new Error(json.error || "Request failed");
    }

    return json;
}

// GET all repertoires
export async function getRepertoires() {
    return request("/api/repertoires");
}

// CREATE or UPDATE
export async function saveRepertoire(repertoire) {
    return request("/api/repertoires", {
        method: "POST",
        body: JSON.stringify(repertoire),
    });
}

// DELETE
export async function deleteRepertoire(id) {
    return request("/api/repertoires", {
        method: "DELETE",
        body: JSON.stringify({ id }),
    });
}