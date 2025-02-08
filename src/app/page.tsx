import Link from "next/link";


export default function Home() {
    return (
        // <div>Muon test gi thi di vao day nha: <span className="text-primary-blue font-semibold">localhost:3000/justforfun</span></div>
        <div className="">
            Muon test gi thi di vao day nha:
            <Link
                href='/justforfun'
                className="font-semibold text-primary-blue"

            >
                localhost:3000/justforfun
            </Link>
        </div>
    );
}
