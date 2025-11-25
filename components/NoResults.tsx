
export default function NoResults({ message = "No bosses found matching your criteria." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-300">
            <img
                src="https://www.tibiawiki.com.br/images/f/ff/Baby_Demon.gif"
                alt="No results"
                className="w-12 h-12 mb-4 object-contain opacity-80"
            />
            <p className="text-secondary text-base font-medium">{message}</p>
        </div>
    );
}
