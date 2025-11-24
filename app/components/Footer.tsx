'use client';

export function Footer() {
    return (
        <div className="site-footer w-full px-6 md:px-12 py-16 border-t border-gray-200 flex justify-center" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '979px', width: '100%' }}>
                <div className="text-gray-500 text-sm flex justify-between items-center">
                    <p>© 2025 TREEN. All Rights Reserved.</p>
                    <p>KVK: 76870111 | BTW-ID NL003118400B65</p>
                </div>
            </div>
        </div>
    );
}
