import React from 'react';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import ThemeToggle from './ThemeToggle';
import { View } from '../App';

interface HeaderProps {
    currentView: View;
}

const Header: React.FC<HeaderProps> = ({ currentView }) => {
    const titleMap: Record<View, string> = {
        sales: "Lanchonete 3 Irmãos — Frente de Caixa",
        inventory: "Lanchonete 3 Irmãos — Controle de Estoque",
        recycle_bin: "Lanchonete 3 Irmãos — Lixeira"
    };

    const title = titleMap[currentView];

    return (
        <header className="bg-surface dark:bg-dark-surface shadow-md">
            <div className="container mx-auto px-4 md:px-6 py-3">
                <div className="flex items-center justify-between">
                     <div className="flex items-center">
                        <ClipboardDocumentListIcon className="h-8 w-8 text-accent" />
                        <h1 className="text-xl md:text-3xl font-bold text-text-primary dark:text-dark-text-primary ml-3">
                           {title}
                        </h1>
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
};

export default Header;