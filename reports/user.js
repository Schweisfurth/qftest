// Use this file to customize the QF-Test HTML report
const modalTriggersSelector = 'a[href$=".png"], .message p, .longmessage p';
let modalTriggers = []
let triangleSvg = `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.285 3.85831C11.0618 2.56363 12.9382 2.56363 13.715 3.85831L22.1826 17.971C22.9824 19.3041 22.0222 21 20.4676 21H3.53238C1.97779 21 1.01757 19.3041 1.81739 17.971L10.285 3.85831Z" fill="currentColor"/>
</svg>`
let closeSvg = `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1ZM15.7071 9.70711C16.0976 9.31658 16.0976 8.68342 15.7071 8.29289C15.3166 7.90237 14.6834 7.90237 14.2929 8.29289L12 10.5858L9.70711 8.29291C9.31658 7.90238 8.68342 7.90238 8.29289 8.29291C7.90237 8.68343 7.90237 9.3166 8.29289 9.70712L10.5858 12L8.2929 14.2929C7.90238 14.6834 7.90238 15.3166 8.2929 15.7071C8.68342 16.0976 9.31659 16.0976 9.70711 15.7071L12 13.4142L14.2929 15.7071C14.6834 16.0976 15.3166 16.0976 15.7071 15.7071C16.0976 15.3166 16.0976 14.6834 15.7071 14.2929L13.4142 12L15.7071 9.70711Z" fill="currentColor"/>
</svg>`

let localizedStrings = {
    "Previous row (arrow up)": "Vorherige Zeile (Pfeiltaste hoch)",
    "Next row (arrow down)": "Nächste Zeile (Pfeiltaste runter)",
    "Previous (Arrow left)": "Zurück (Pfeiltaste links)",
    "Next (Arrow right)": "Weiter (Pfeiltaste rechts)",
    "Close (escape)": "Schließen (ESC-Taste)",
}

document.addEventListener("DOMContentLoaded", function(event) {
    // Attach simple modals to image links and truncated error messages
    modalTriggers = Array.from(document.querySelectorAll(modalTriggersSelector));
    setTimeout(() => {
        modalTriggers.forEach((trigger, i) => {
            trigger.dataset.modalTriggerId = "t"+i;
            prevTrigger = modalTriggers?.[modalTriggers.indexOf(trigger) - 1];
            nextTrigger = modalTriggers?.[modalTriggers.indexOf(trigger) + 1];
            attachModal(trigger, prevTrigger, nextTrigger);
        });
        if (window.location.search) {
            // Open linked modal
            let triggerId = window.location.search.replace("?modal=", "");
            let trigger = document.querySelector("[data-modal-trigger-id="+triggerId+"]");
            if (trigger) {
                trigger.click();
            }
        }
    }, 0);

    // Modal Keyboard navigation
    document.body.addEventListener('keydown', (keyEvent) => {
        modal = document.querySelector("#modal");
        if (!modal || ! modal.open) {
            return;
        }
        if (keyEvent.ctrlKey || keyEvent.shiftKey || keyEvent.altKey || keyEvent.metaKey) {
            return;
        }

        if (keyEvent.key == "Escape") {
            keyEvent.stopPropagation();
            keyEvent.preventDefault();
            closeModal(modal);
        }

        if (keyEvent.key == "ArrowLeft") {
            prevTrigger = document.querySelector(`[data-modal-trigger-id="${modal.dataset.prevTrigger}"]`);
            if (prevTrigger) {
                switchModal(modal, prevTrigger);
                keyEvent.stopPropagation();
            }
        } else if (keyEvent.key == "ArrowRight") {
            nextTrigger = document.querySelector(`[data-modal-trigger-id="${modal.dataset.nextTrigger}"]`);
            if (nextTrigger) {
                switchModal(modal, nextTrigger);
                keyEvent.stopPropagation();
            }
        } else if (keyEvent.key == "ArrowUp") {
            prevTrigger = document.querySelector("button#modal-previous-row");
            if (prevTrigger) {
                prevTrigger.click();
                keyEvent.stopPropagation();
            }
        } else if (keyEvent.key == "ArrowDown") {
            nextTrigger = document.querySelector("button#modal-next-row");
            if (nextTrigger) {
                nextTrigger.click();
                keyEvent.stopPropagation();
            }
        }
    });

    window.addEventListener('resize', () => {
        markUndersized(document.querySelector(".mainImg"))
    });
});

/**
 * Attach a modal overlay to the given trigger, with next/previous navigation
 *
 * @param {Element} trigger
 * @param {Element} prevTrigger
 * @param {Element} nextTrigger
 * @returns {Element}
 */
function attachModal(trigger, prevTrigger, nextTrigger) {
    const lastDown = {};
    trigger.addEventListener("mousedown", (downEvent) => {
        lastDown.x = downEvent.clientX;
        lastDown.y = downEvent.clientY;
    });
    trigger.addEventListener("click", (clickEvent) => {
        if (trigger.tagName == "P") {
            const realClick = clickEvent.clientX > 0 || clickEvent.clientY > 0;
            if (realClick && (Math.abs(clickEvent.clientX - lastDown.x) > 5 || Math.abs(clickEvent.clientY - lastDown.y) > 5)) {
                return; // don't open modal on message select
            }
        }

        clickEvent.preventDefault();
        let modal = document.querySelector("DIALOG#modal");
        if (!modal) {
            modal = document.createElement("DIALOG");
            modal.id = "modal";
            document.body.appendChild(modal);
        }
        modal.dataset.trigger = trigger.dataset.modalTriggerId;
        if (prevTrigger) {
            modal.dataset.prevTrigger = prevTrigger.dataset.modalTriggerId;
        }
        if (nextTrigger) {
            modal.dataset.nextTrigger = nextTrigger.dataset.modalTriggerId;
        }
        modal.innerHTML = "";
        modal.appendChild(modalContent(trigger, prevTrigger, nextTrigger, modal));

        trigger.focus();
        modal.showModal();

        if (window.location.search) {
            history.replaceState(null, null, (window.location+"").replace(window.location.search, "?modal="+trigger.dataset.modalTriggerId));
        } else if (window.location.hash) {
            history.replaceState(null, null, (window.location+"").replace("#", "?modal="+trigger.dataset.modalTriggerId+"#"));
        } else {
            history.replaceState(null, null, window.location+"?modal="+trigger.dataset.modalTriggerId);
        }
    });
}

function switchModal(modal, nextModalTrigger) {
    nextModalTrigger.click();
    // Scroll the current trigger link into view
    navigationBarOffset = 85;
    window.scrollTo({
        top: nextModalTrigger.getBoundingClientRect().top + window.pageYOffset - navigationBarOffset,
        behavior: "smooth"
    });
    // Give the current trigger link a
    // focus ring to orientate the user.
    nextModalTrigger.focus();
}

/**
 *
 * @param {Element} trigger
 * @param {Element} prevTrigger
 * @param {Element} nextTrigger
 * @param {Element} modal
 * @returns {Element}
 */
function modalContent(trigger, prevTrigger, nextTrigger, modal) {

    let modalContent = document.createElement("DIV");
    modalContent.id = "modal-content";
    const imgWrapper = createModalContentFor(trigger, false);
    modalContent.appendChild(imgWrapper);

    modalContent.onclick = (event) => {
        if (!modalContent.querySelector("img")) return;
        if (event.target.closest(".modal-content-desc")) return;

        document.body.classList.toggle("modal-img-pixel-correct");
        markUndersized(imgWrapper)
    };

    const modalOpening = modal && modal.getBoundingClientRect().height == 0;
    setTimeout(() => markUndersized(imgWrapper),modalOpening ? 210 : 0);

    let parentRow = trigger.closest("tr");
    let relatedTriggers = getRelatedTriggers(trigger, parentRow);

    let close = document.createElement("BUTTON");
    close.id = "modal-close";
    close.innerHTML = closeSvg;
    close.setAttribute("autofocus", null);
    close.title = _("Close (escape)");
    close.onclick = () => {
        closeModal(modal);
    }

    let header = document.createElement("DIV");
    header.id = "modal-header";
    header.appendChild(createNavigateRowButton(relatedTriggers, prevTrigger, true));
    let parentEl = trigger.closest(".leaf, .branch");
    if (parentEl) {
        let heading = parentEl.querySelector("h2,h3,h4,h5,h6");
        if (heading) {
            let icon = heading.querySelector("img");
            if (icon) {
                header.appendChild(icon.cloneNode(false));
            }
            let title = document.createElement("DIV")
            title.id = "modal-table-heading"
            title.innerText = heading.innerText
            header.appendChild(title);
        }
    }
    if (parentRow) {
        let icon = parentRow.querySelector("td.marginicon img");
        let titleicon = parentRow.querySelector("td.testset img.icon, td.testcase img.icon");
        let title = parentRow.querySelector("td.testset, td.testcase");
        if (header.querySelector("#modal-table-heading") && (icon || titleicon || title)) {
            let separator = document.createElement("DIV")
            separator.classList.add("breadcrumb-separator")
            separator.innerHTML = "&#10132;"
            header.appendChild(separator);
        }
        if (icon) {
            header.appendChild(icon.cloneNode(false));
        }
        if (titleicon) {
            header.appendChild(titleicon.cloneNode(false));
        }
        if (title) {
            let el = document.createElement("DIV");
            el.classList.add("title");
            el.textContent = title.textContent;
            header.appendChild(el);
        }
    }
    header.appendChild(createNavigateRowButton(relatedTriggers, nextTrigger));
    header.appendChild(close);


    let footerItems = []

    if (parentRow) {
        if (relatedTriggers) {
            footerItems = relatedTriggers.map((targetTrigger) => {
                let button = document.createElement("BUTTON");
                button.classList.add("relatedTrigger");
                button.appendChild(createModalContentFor(targetTrigger, true));
                if (trigger === targetTrigger) {
                    button.classList.add("current");
                } else {
                    button.onclick = () => {
                        switchModal(modal, targetTrigger);
                    };
                }
                return button;
            });
        }
    }

    let footer = document.createElement("DIV");
    footer.id = "modal-footer";
    if (footerItems) {
        footerItems.forEach((item) => {
            footer.appendChild(item);
        });
    }

    let container = document.createElement("DIV");
    container.id = "modal-container";

    container.appendChild(header);
    container.appendChild(modalContent);
    container.appendChild(createNavigateTriggerButton(prevTrigger, true));
    container.appendChild(footer);
    container.appendChild(createNavigateTriggerButton(nextTrigger));

    return container;
}

function getRelatedTriggers(trigger, parentRow) {
    if (!parentRow) {
        parentRow = trigger.closest("tr");
    }
    let result = [];
    if (parentRow) {
        result = Array.from(parentRow.querySelectorAll(modalTriggersSelector));
    }
    return result;
}

function createNavigateTriggerButton(targetTrigger, back) {
    let result = document.createElement("BUTTON");
    result.innerHTML = triangleSvg;
    if (back) {
        result.id = "modal-prev";
        result.title = _("Previous (Arrow left)");
    } else {
        result.id = "modal-next";
        result.title = _("Next (Arrow right)");
    }
    if (targetTrigger) {
        result.onclick = () => {
            switchModal(modal, targetTrigger);
        }
    } else {
        result.setAttribute("disabled", 1);
    }
    return result;

}

function createNavigateRowButton(relatedTriggers, fallbackTrigger, back) {
    let result = document.createElement("BUTTON");
    result.id = back ? "modal-previous-row" : "modal-next-row";
    result.innerHTML = triangleSvg;
    result.title = back ? _("Previous row (arrow up)") : _("Next row (arrow down)");

    let targetRowTrigger = null
    let bestRelatedTrigger = relatedTriggers.at(back ? 0 : -1);
    if (bestRelatedTrigger) {
        targetRowTrigger = modalTriggers?.[modalTriggers.indexOf(bestRelatedTrigger) + (back ? -1 : 1)]
        if (back) {
            targetRowTrigger = getRelatedTriggers(targetRowTrigger).at(0)
        }
    }
    if (!targetRowTrigger && fallbackTrigger) {
        targetRowTrigger = fallbackTrigger
    }
    if (targetRowTrigger) {
        result.onclick = () => { switchModal(modal, targetRowTrigger); };
    } else {
        result.setAttribute("disabled", 1);
    }
    return result;
}

function createModalContentFor(trigger, preview) {
    if (trigger.tagName == "A") {
        let thumbnail = trigger.querySelector("img")
        let imgTitle = (trigger.textContent || !thumbnail) ? trigger.textContent : thumbnail.getAttribute("title");
        // Use smaller thumbnail image for previews
        let imgUrl = (preview && thumbnail) ? thumbnail.getAttribute("src") : trigger.getAttribute("href");
        let imgWrapper = document.createElement("DIV");
        imgWrapper.classList.add("imgWrapper");
        imgWrapper.innerHTML = `
        <div class="modal-content-desc"><strong>${imgTitle}</strong> (${imgUrl})</div>
        <div class="inner-img-wrapper">
            <img alt="${imgTitle}" src="${imgUrl}" />
        </div>
        `;
        if (!preview) {
            imgWrapper.classList.add("mainImg");
        }
        return imgWrapper;
    } else if (trigger.tagName == "P") {
        message = document.createElement("P");
        message.classList = trigger.classList;
        message.innerHTML = trigger.innerHTML;
        return message;
    }
}
function markUndersized(imgWrapper) {
    if (! imgWrapper) return;
    const img = imgWrapper.querySelector("img");
    if (! img) return;
    const rect = imgWrapper.parentElement.getBoundingClientRect();
    const desc = imgWrapper.querySelector(".modal-content-desc");
    if (desc) {
        rect.height -= desc.getBoundingClientRect().height;
    }
    const percentage = Math.min(rect.width/img.naturalWidth, rect.height/img.naturalHeight);
    if (percentage > 1) {
        img.classList.add("undersized");
    } else {
        img.classList.remove("undersized");
    }
    if (percentage >= 4) {
        img.classList.add("pixelated");
    } else {
        img.classList.remove("pixelated");
    }
}

function closeModal(modal) {
    modal.close()
    if (window.location.search) {
        history.replaceState(null, null, (window.location+"").replace(window.location.search, ""));
    }
}

function _(string) {
    if (document.documentElement.lang === "de") {
        translation = localizedStrings[string]
        if (!translation) {
            console.error("No DE translation found for string", string)
            return string
        }
        return translation
    }
    return string
}