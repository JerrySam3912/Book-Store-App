function getImgUrl(name) {
    if (!name) return "";

    // 1. Nếu là link ảnh online (ví dụ paste link Google, Cloudinary...)
    if (name.startsWith("http://") || name.startsWith("https://")) {
        return name;
    }

    // 2. Nếu là tên file ảnh trong folder assets (code cũ)
    return new URL(`../assets/books/${name}`, import.meta.url).href;
}

export { getImgUrl };