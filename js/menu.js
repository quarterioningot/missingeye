let selectedMenu = ""

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);

    if (!element) {
        return;
    }

    element.scrollIntoView({
        block: "start",
        behavior: "smooth"
    })
}

function elementInViewport2(el) {
    let top = el.offsetTop
    let left = el.offsetLeft
    const width = el.offsetWidth
    const height = el.offsetHeight

    while(el.offsetParent) {
        el = el.offsetParent
        top += el.offsetTop
        left += el.offsetLeft
    }

    return (
        top < (window.pageYOffset + window.innerHeight) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset
    )
}

function scanViews() {
    const views = document.querySelectorAll("[data-view]")
    for (const view of views) {
        const isInView = elementInViewport2(view)
        console.log(view, isInView)
    }
}

((window) => {
    let isViewScanRequested = false
    window.addEventListener("scroll", event => {
        if (!isViewScanRequested) {
            isViewScanRequested = true
            window.requestAnimationFrame(() => {
                scanViews()
                isViewScanRequested = false
            })
        }
    }, true)
})(window)

window.onclick = event => {
    const target = event.target;
    if (!target) {
        return
    }

    if (target.tagName !== "A") {
        return
    }

    const menuItem = target.getAttribute("data-menu")

    if (!menuItem) {
        return
    }

    event.preventDefault()

    if (selectedMenu === menuItem) {
        return
    }

    if (selectedMenu) {
        const selector = `[data-menu="${selectedMenu}"]`
        const previousMenuItems = document.querySelectorAll(selector)
        for (const previousMenuItem of previousMenuItems) {
            previousMenuItem.classList.remove("item-active")
        }
    }

    selectedMenu = menuItem

    const selector = `[data-menu="${selectedMenu}"]`
    const newMenuItems = document.querySelectorAll(selector)
    for (const newMenuItem of newMenuItems) {
        newMenuItem.classList.add("item-active")
    }

    scrollToSection(selectedMenu)
}

((window) => {
    let isViewScanRequested = false
    window.addEventListener("resize", event => {
        if (!isViewScanRequested) {
            isViewScanRequested = true
            window.requestAnimationFrame(() => {
                scrollToSection(selectedMenu)
                isViewScanRequested = false
            })
        }
    }, true)
})(window)


export function LoadMenu() {

}