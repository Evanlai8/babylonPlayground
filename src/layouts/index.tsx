
import { Space, Button } from "antd"
import { Link } from 'umi'
import styles from './index.less';


document.documentElement.style["overflow"] = "hidden";
document.documentElement.style.overflow = "hidden";
document.documentElement.style.width = "100%";
document.documentElement.style.height = "100%";
document.documentElement.style.margin = "0";
document.documentElement.style.padding = "0";
document.body.style.overflow = "hidden";
document.body.style.width = "100%";
document.body.style.height = "100%";
document.body.style.margin = "0";
document.body.style.padding = "0";

const BasicLayout = (props) => {
  const { children } = props
  return (
    <div style={{width: '100%', height: "100vh", overflow: 'hidden'}}>
      { children }
      <div style={{height: 50, position:"fixed", bottom: 0, left:0, right: 0, backgroundColor: "#fff"}}>
        <Space direction='horizontal' align="center" style={{padding: 5}}>
          <Button type='primary' >
            <Link to='/home'>Home</Link>  
          </Button>
          <Button type='primary'><Link to='/room/1'>Game Room</Link></Button>
          <Button type='primary'><Link to='/room/2'>Avatar</Link></Button>
        </Space>
      </div>
    </div>
  );
}

export default BasicLayout