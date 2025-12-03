"use client";

export default function PurchasingCube() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Purchasing Cube</h1>

      <iframe
        src="http://localhost:8080/mondrian/testpage.jsp?query=purchasing"
        style={{
          width: "100%",
          height: "85vh",
          border: "1px solid #ccc",
          background: "white"
        }}
      />
    </div>
  );
}
