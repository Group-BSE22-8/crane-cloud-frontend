import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InformationBar from '../InformationBar';
import Header from '../Header';
import PrimaryButton from '../PrimaryButton';
import deleteProject, { clearDeleteProjectState } from '../../redux/actions/deleteProject';
import updateProject from '../../redux/actions/updateProject';
import Spinner from '../Spinner';
import Modal from '../Modal';
import SideBar from '../SideBar';
import TextArea from '../TextArea';
import Feedback from '../Feedback';
import DeleteWarning from '../DeleteWarning';
import BlackInputText from '../BlackInputText';
import './ProjectSettingsPage.css';

class ProjectSettingsPage extends React.Component {
  constructor(props) {
    super(props);
    const { name, description } = props;
    this.state = {
      openUpdateModal: false,
      openDeleteAlert: false,
      openDropDown: false,
      projectName: name ? props.name : '',
      projectDescription: description ? props.description : '',
      error: ''
    };

    this.container = React.createRef();

    this.handleDeleteProject = this.handleDeleteProject.bind(this);
    this.showDeleteAlert = this.showDeleteAlert.bind(this);
    this.hideDeleteAlert = this.hideDeleteAlert.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateProjectName = this.validateProjectName.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }
  
  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentDidUpdate(prevProps) {
    const { isDeleted } = this.props;

    if (isDeleted !== prevProps.isDeleted) {
      this.hideDeleteAlert();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside(event) {
    if (this.container.current && !this.container.current.contains(event.target)) {
      this.setState({
        openDropDown: false
      });
    }
  }

  validateProjectName(name) {
    if (/^[a-z]/i.test(name)) {
      if (name.match(/[^-a-zA-Z]/)) {
        return 'false_convention';
      }
      return true;
    }
    return false;
  }

  handleChange(e) {
    const { error } = this.state;
    this.setState({
      [e.target.name]: e.target.value
    });

    if (error) {
      this.setState({
        error: ''
      });
    }
  }

  handleSubmit() {
    const { projectName, projectDescription } = this.state;
    const {
      updateProject, cardID, name, description
    } = this.props;

    if (projectName !== name || projectDescription !== description) {
      if (!projectName || !projectDescription) {
        this.setState({
          error: 'please provide either a new name or description'
        });
      } else {
        if (projectName !== name && projectDescription === description) {
          if (!this.validateProjectName(projectName)) {
            this.setState({
              error: 'name should start with a letter'
            });
          } else if (this.validateProjectName(projectName) === 'false_convention') {
            this.setState({
              error: 'name may only contain letters and a hypen -'
            });
          } else if (projectName.length > 22) {
            this.setState({
              error: 'project name cannot exceed 22 characters'
            });
          } else {
            const newProject = { name: projectName };
            updateProject(cardID, newProject);
          }
        }

        if (projectName === name && projectDescription !== description) {
          const newProject = { description: projectDescription };
          updateProject(cardID, newProject);
        }

        if (projectName !== name && projectDescription !== description) {
          if (!this.validateProjectName(projectName)) {
            this.setState({
              error: 'name should start with a letter'
            });
          } else if (this.validateProjectName(projectName) === 'false_convention') {
            this.setState({
              error: 'name may only contain letters and a hypen -'
            });
          } else {
            const newProject = { name: projectName, description: projectDescription };
            updateProject(cardID, newProject);
          }
        }
      }
    }
  }


  handleDeleteProject(e, projectID) {
    const { deleteProject } = this.props;
    e.preventDefault();
    deleteProject(projectID);
  }


  showDeleteAlert() {
    this.setState({ openDeleteAlert: true });
  }

  hideDeleteAlert() {
    const { clearDeleteProjectState } = this.props;
    clearDeleteProjectState();
    this.setState({ openDeleteAlert: false });
  }

  render() {
    const {
      match: { params },
      name,
      isDeleting,
      // data,
      description,
      cardID,
      isUpdating,
      // message,
      isFailed
    } = this.props;
    const userId = params.userId;
    const { projectName } = this.props.location.state;
    const {
      openDeleteAlert,
      // projectName,
      projectDescription,
      error
    } = this.state;

    return (
      <div className="Page">
        <div className="TopBarSection"><Header /></div>
        <div className="MainSection">
          <div className="SideBarSection">
            <SideBar projectName={projectName} userId={userId} projectID={params.projectID} />
          </div>
          <div className="MainContentSection">
            <div className="InformationBarSection">
              <InformationBar
                header="Settings"
              />
            </div>
            <div className="ContentSection">
              <div>
                <form>
                  <div className="UpdateForm">
                    <BlackInputText
                      placeholder="Project Name"
                      name="projectName"
                      value={projectName}
                      onChange={(e) => {
                        this.handleChange(e);
                      }}
                    />
                    <TextArea
                      placeholder="Description"
                      name="projectDescription"
                      value={projectDescription}
                      onChange={(e) => {
                        this.handleChange(e);
                      }}
                    />

                    <PrimaryButton label="Update Project" className="" onClick={(e) => this.handleDeleteProject(e, cardID)} />
                  </div>
                </form>
                
              </div>
              <div>
                <PrimaryButton label="Delete Project" className="DeleteBtn" onClick={(e) => this.handleDeleteProject(e, cardID)} />
              </div>
                <p>I gott this, Greatest Coder Ever!</p>
                {(openDeleteAlert && (
                  <div className="ProjectDeleteModel">
                    <Modal showModal={openDeleteAlert} onClickAway={this.hideDeleteAlert}>
                      <div className="DeleteProjectModel">
                        <div className="DeleteProjectModalUpperSection">
                          <div className="DeleteDescription">
                            Are you sure you want to delete&nbsp;
                            <span>{name}</span>
                              &nbsp;
                            ?
                            <DeleteWarning />
                          </div>
                        </div>

                        <div className="DeleteProjectModalLowerSection">
                          <div className="DeleteProjectModelButtons">
                            <PrimaryButton label="cancel" className="CancelBtn" onClick={this.hideDeleteAlert} />
                            <PrimaryButton label={isDeleting ? <Spinner /> : 'Delete'} className="DeleteBtn" onClick={(e) => this.handleDeleteProject(e, cardID)} />
                          </div>

                          {/* {(isFailed && message) && (
                            <Feedback
                              message={message}
                              type="error"
                            />
                          )} */}
                        </div>
                      </div>

                    </Modal>
                  </div>
                ))}
            </div>
          </div>
        </div>


      </div>
    );
  }
}

ProjectSettingsPage.propTypes = {
  // data: PropTypes.shape({
  //   id: PropTypes.string.isRequired
  // }).isRequired,
  // message: PropTypes.string,
  // isUpdated: PropTypes.bool,
  // isDeleted: PropTypes.bool
};

ProjectSettingsPage.defaultProps = {
  // message: '',
  // isUpdated: false,
  // isDeleted: false,
};

const mapStateToProps = (state) => {
  // const { data } = state.user;
  // const { isDeleted } = state.deleteProjectReducer;
  // const { isUpdated } = state.updateProjectReducer;
  return {
    // data,
    // isUpdated,
    // message,
    // isDeleted
  };
};

export default ProjectSettingsPage;
