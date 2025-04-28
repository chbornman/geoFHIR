import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>GeoFHIR - Healthcare Geographic Analysis</title>
        <meta name="description" content="Analyze geographic patterns in healthcare data using FHIR standards" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome to GeoFHIR</h1>
        <p>A platform for analyzing geographic patterns in healthcare data using FHIR standards</p>
      </main>
    </div>
  );
}