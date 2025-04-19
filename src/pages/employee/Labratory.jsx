import Employee from './Employee';
import SystemConstant from '../../data/constants';

const Labratory=()=>{
  return (
    <>
      <Employee
        params={{type:SystemConstant.EmployeeType.Labratory}}
        subModel='LabratoryStuff'
      />
    </>
  )
}
export default Labratory