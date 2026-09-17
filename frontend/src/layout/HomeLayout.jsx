import { Layout, Button } from 'antd';
import { WalletOutlined, SafetyCertificateOutlined, UserOutlined, UserAddOutlined } from "@ant-design/icons";
import { Link, useLocation } from 'react-router-dom';

const { Header, Footer, Content } = Layout;

const HomeLayout = ({ children }) => {
  const location = useLocation();

  return (
    <Layout className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Header className="!bg-white border-b border-slate-200/90 !h-16 !leading-normal flex items-center justify-between !px-4 md:!px-10 sticky top-0 z-50 shadow-xs">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF735C] to-indigo-600 flex items-center justify-center text-white text-xl shadow-md shrink-0">
            <WalletOutlined />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-slate-900 text-lg md:text-xl font-black tracking-tight m-0 p-0 leading-tight flex items-center">
              Expense<span className="text-[#FF735C]">AI</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mt-0.5">
              Daily Tracker
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 font-semibold bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <SafetyCertificateOutlined className="text-emerald-600 text-base" /> 256-Bit Encrypted & Private
          </div>

          <div className="flex items-center gap-2">
            {location.pathname !== "/" && (
              <Link to="/">
                <Button icon={<UserOutlined />} className="!border-slate-300 !font-semibold">
                  Sign In
                </Button>
              </Link>
            )}
            {location.pathname !== "/signup" && (
              <Link to="/signup">
                <Button type="primary" icon={<UserAddOutlined />} className="!bg-[#FF735C] hover:!bg-[#e55a43] !border-none !font-bold">
                  Register
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Header>

      <Content className="flex-1 flex items-center justify-center p-4 md:p-8 bg-slate-50">
        <div className="w-full max-w-5xl">
          {children}
        </div>
      </Content>

      <Footer className="!bg-white !text-slate-500 border-t border-slate-200/80 text-center py-4 text-xs font-medium">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-5xl mx-auto px-4 gap-2">
          <span>© {new Date().getFullYear()} ExpenseAI Tracker. All rights reserved.</span>
          <span className="text-slate-400">Professional Financial App</span>
        </div>
      </Footer>
    </Layout>
  );
};

export default HomeLayout;


