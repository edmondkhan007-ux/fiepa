import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"FiePa | FairRent GH",description:"A clearer renting experience in Ghana."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
