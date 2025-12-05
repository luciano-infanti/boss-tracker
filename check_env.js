
console.log("Checking BLOB_READ_WRITE_TOKEN...");
if (process.env.BLOB_READ_WRITE_TOKEN) {
    console.log("Token is present (starts with " + process.env.BLOB_READ_WRITE_TOKEN.substring(0, 5) + "...)");
} else {
    console.log("Token is MISSING");
}
