import { test_connection } from './connection_test.js';

const test_urls = [
    "https://supacall.onrender.com",
    "https://socket-io-7yss.onrender.com",
    "http://localhost:3000",
    "https://easy-koala-usefully.ngrok-free.app"    
];

document.addEventListener('DOMContentLoaded', function() {
    const existing_header = document.querySelector('header');
    if (existing_header) {
        existing_header.remove();
    }

    const header = jte({
        tag: 'header'
    });

    const category = jte({
        tag: 'category'
    });

    header.appendChild(category);
    document.body.appendChild(header);

    const open_dialog_button = jte({
        tag: 'button',
        textnode: 'Abrir Dialog',
        onclick: () => {
            const dialog = jte({
                tag: 'dialog',
                type: 'supacall'
            });

            const container = jte({
                tag: 'container'
            });

            test_urls.forEach(url => {
                const test_button = jte({
                    tag: 'button',
                    textnode: `Testar ${url}`,
                    onclick: () => test_connection(url)
                });
                dialog.appendChild(test_button);
            });

            const close_button = jte({
                tag: 'button',
                textnode: 'Fechar',
                onclick: () => dialog.close()
            });

            dialog.appendChild(container);
            dialog.appendChild(close_button);
            document.body.appendChild(dialog);
            dialog.showModal();
        }
    });
    document.body.appendChild(open_dialog_button);
});