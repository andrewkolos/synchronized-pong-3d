const bounce = "data:audio/mpeg;base64,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";
export default bounce;
