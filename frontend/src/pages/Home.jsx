import React, { useState, useRef, useEffect} from 'react'
import useGetAssetInfo from '../hooks/getAssetInfo'
import Header from '../components/Header';
import PortfolioInputForm from '../components/PortfolioInputForm';
import MarkowitzChart from '../components/MarkowitzChart';
import Footer from '../components/Footer';
import CovarianceCorrelation from '../components/CovarianceCorrelation';
import NavComp from '../components/NavComp';
import ConstraintsComponent from '../components/Constraints';

const Home = () => {
    const { getAssetInfo, setAssetInfo, loading, error, assetInfo } = useGetAssetInfo();
    const sectionRefs = {
        portfolioInputs: useRef(null),
        portfolio: useRef(null),
        matrices: useRef(null),
        constraints: useRef(null),
        charts: useRef(null),
        results: useRef(null),
    };

    const [visibleSection, setVisibleSection] = useState('');

    // Use IntersectionObserver to detect visibility
    useEffect(() => {
        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setVisibleSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.75, // Trigger when 50% of the section is visible
        });

        Object.values(sectionRefs).forEach(ref => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => {
            Object.values(sectionRefs).forEach(ref => {
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            });
        };
    }, []);

    return (
        <div className='bg-slate-700'>
            <Header />
            <NavComp sectionRefs={sectionRefs} visibleSection={visibleSection}/>
            <div className="container mx-auto py-6 px-4">
                <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">Markowitz Efficient Frontier</h1>
                <PortfolioInputForm portfolioInputRef={sectionRefs.portfolioInputs} portfolioRef={sectionRefs.portfolio} assetInfo={assetInfo} getAssetInfo={getAssetInfo} setAssetInfo={setAssetInfo} loading={loading} error={error}/>
                <CovarianceCorrelation assetInfo={assetInfo} matricesRef={sectionRefs.matrices}/>
                <ConstraintsComponent constraintRef={sectionRefs.constraints} assetInfo={assetInfo} loading={loading} error={error}/>
                <MarkowitzChart chartsRef={sectionRefs.charts} assetInfo={assetInfo}/>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
