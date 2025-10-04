import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import Button from "@/components/ui/Button";

export default function PlacementPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [scores, setScores] = useState({ reading: 0, writing: 0, speaking: 0 });
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch("http://localhost:8000/api/placement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          readingScore: scores.reading,
          writingScore: scores.writing,
          speakingScore: scores.speaking,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`${data.message} | Level: ${data.level}`);
      } else {
        setMessage(`Error: ${data.detail || data.message}`);
      }
    } catch (error) {
      console.error("Error submitting placement:", error);
      setMessage("Error submitting placement test.");
    }
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-2xl font-bold mb-6">Placement Test</h1>

      <label>Reading Score:</label>
      <input
        type="number"
        value={scores.reading}
        onChange={(e) => setScores({ ...scores, reading: +e.target.value })}
        className="border p-2 mb-3"
      />

      <label>Writing Score:</label>
      <input
        type="number"
        value={scores.writing}
        onChange={(e) => setScores({ ...scores, writing: +e.target.value })}
        className="border p-2 mb-3"
      />

      <label>Speaking Score:</label>
      <input
        type="number"
        value={scores.speaking}
        onChange={(e) => setScores({ ...scores, speaking: +e.target.value })}
        className="border p-2 mb-3"
      />

      <Button onClick={handleSubmit}>Submit Placement</Button>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
