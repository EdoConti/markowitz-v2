import { useState } from 'react';
import axios from 'axios';

const useGetOptimizedPortfolio = () => {
    const [portfolioLoading, setPortfolioLoading] = useState(false);
    const [portfolioError, setPortfolioError] = useState(null);
    const [optimalPortfolio, setOptimalPortfolio] = useState({});

    const getOptimizedPortfolio = async (tickers, weights, riskFree, riskFree_Type, liquidityFactor = 0.5, labels) => {
        setPortfolioLoading(true);
        setPortfolioError(null);

        console.log(labels);
        try {
            const response = await axios.post(
                'https://markowitz-optimization.onrender.com/api/securities/optimal_portfolio',
                {
                    tickers,
                    weights,
                    riskFree,
                    riskFree_Type,
                    liquidityFactor,
                    labels
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Set the optimal portfolio response data to state
            setOptimalPortfolio({
                riskFree_c: response.data.riskFree,
                optimalWeights: response.data.optimal_weights,
                optimalReturn: response.data.optimal_return,
                optimalRisk: response.data.optimal_risk,
                optimalSharpe: response.data.optimal_sharpe,
                efficientFrontier: response.data.efficient_frontier,
                liquidityTarget: response.data.liquid_target_min,
                liquidShare: response.data.liquid_share_achieved

            });

        } catch (err) {
            // Handle any errors
            setPortfolioError(err.response ? err.response.data.error : 'An error occurred on the front end');
        } finally {
            setPortfolioLoading(false);
        }
    };

    return {
        getOptimizedPortfolio,
        optimalPortfolio,
        portfolioLoading,
        portfolioError,
    };
};

export default useGetOptimizedPortfolio;
