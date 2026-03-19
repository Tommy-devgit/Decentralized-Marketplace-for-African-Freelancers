export const runtime = "nodejs";

const PINATA_JWT = process.env.PINATA_JWT ?? "";

export async function POST(request: Request) {
  if (!PINATA_JWT) {
    return Response.json(
      { error: "Missing PINATA_JWT in environment." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  const pinataData = new FormData();
  pinataData.append("file", file, file.name);
  pinataData.append(
    "pinataMetadata",
    JSON.stringify({ name: file.name || "upload" })
  );

  try {
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: pinataData,
        signal: AbortSignal.timeout(30000),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: result?.error || "Pinata upload failed." },
        { status: 500 }
      );
    }

    return Response.json({ cid: result.IpfsHash });
  } catch (error: any) {
    return Response.json(
      {
        error:
          error?.cause?.code === "UND_ERR_CONNECT_TIMEOUT"
            ? "Pinata request timed out. Check connectivity or try again."
            : error?.message ?? "Pinata request failed.",
      },
      { status: 504 }
    );
  }
}