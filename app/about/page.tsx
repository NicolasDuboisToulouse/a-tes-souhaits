'use client'
export default function About() {

  return (
    <div className="main">
      <div><b>À Tes Souhaits</b></div>
      <div>Exprimes tes souhaits et combles ceux des autres !</div>
      <div>Version {process.env.NEXT_PUBLIC_VERSION}</div>
      <div>
        <a className="text-blue-700 hover:underline"
          href="https://github.com/NicolasDuboisToulouse/a-tes-souhaits"
          target="_blank">
          Github source code
        </a>
      </div>
    </div>
  );
}
