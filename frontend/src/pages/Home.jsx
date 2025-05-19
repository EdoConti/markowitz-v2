import useGetAssetInfo from '../hooks/getAssetInfo'
import Header from '../components/Header';
import PortfolioInputForm from '../components/PortfolioInputForm';
import Footer from '../components/Footer';
import CovarianceCorrelation from '../components/CovarianceCorrelation';
import ConstraintsComponent from '../components/Constraints';

const Home = () => {
    const { getAssetInfo, setAssetInfo, loading, error, assetInfo } = useGetAssetInfo();

    return (
        <div className='bg-slate-700'>
            <Header />
            <div className="container mx-auto py-6 px-4">
                <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">Markowitz Efficient Frontier</h1>
                <PortfolioInputForm assetInfo={assetInfo} getAssetInfo={getAssetInfo} setAssetInfo={setAssetInfo} loading={loading} error={error}/>
                <CovarianceCorrelation assetInfo={assetInfo}/>
                <ConstraintsComponent assetInfo={assetInfo} loading={loading} error={error}/>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
