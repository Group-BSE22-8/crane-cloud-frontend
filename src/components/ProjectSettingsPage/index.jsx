import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import InformationBar from "../InformationBar";
import Header from "../Header";
import PrimaryButton from "../PrimaryButton";
import deleteProject, {
  clearDeleteProjectState,
} from "../../redux/actions/deleteProject";
import updateProject, {
  clearUpdateProjectState,
} from "../../redux/actions/updateProject";
import Spinner from "../Spinner";
import Modal from "../Modal";
import SideBar from "../SideBar";
import TextArea from "../TextArea";
import Feedback from "../Feedback";
import DeleteWarning from "../DeleteWarning";
import BlackInputText from "../BlackInputText";
import styles from "./ProjectSettingsPage.module.css";
import SettingsButton from "../SettingsButton";

class ProjectSettingsPage extends React.Component {
  constructor(props) {
    super(props);
    const projectInfo = JSON.parse(localStorage.getItem("project"));
    const { name, description } = projectInfo;

    this.state = {
      openUpdateAlert: false,
      openDeleteAlert: false,
      openDropDown: false,
      projectName: name ? name : "",
      projectDescription: description ? description : "",
      error: "",
      Confirmprojectname: "",
      disableDelete: true,
    };

    this.handleDeleteProject = this.handleDeleteProject.bind(this);
    this.showUpdateAlert = this.showUpdateAlert.bind(this);
    this.hideUpdateAlert = this.hideUpdateAlert.bind(this);
    this.showDeleteAlert = this.showDeleteAlert.bind(this);
    this.hideDeleteAlert = this.hideDeleteAlert.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateProjectName = this.validateProjectName.bind(this);
    this.checkProjectName = this.checkProjectName.bind(this);
    this.renderRedirect = this.renderRedirect.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { isDeleted } = this.props;

    if (isDeleted !== prevProps.isDeleted) {
      this.hideDeleteAlert();
    }
  }
  validateProjectName(name) {
    if (/^[a-z]/i.test(name)) {
      if (name.match(/[^-a-zA-Z]/)) {
        return "false_convention";
      }
      return true;
    }
    return false;
  }
  handleChange(e) {
    const { error, openDeleteAlert } = this.state;
    const projectInfo = JSON.parse(localStorage.getItem("project"));
    const { name } = projectInfo;
    const {
      errorMessage,
      clearUpdateProjectState,
      clearDeleteProjectState,
      isFailed,
      message,
    } = this.props;
    this.setState({
      [e.target.name]: e.target.value,
    });
    if (errorMessage) {
      clearUpdateProjectState();
    }
    if (error) {
      this.setState({
        error: "",
      });
    }
    if (isFailed && message) {
      clearDeleteProjectState();
    }
    if (e.target.value === name && openDeleteAlert) {
      this.setState({
        disableDelete: false,
      });
    } else if (e.target.value !== name && openDeleteAlert) {
      this.setState({
        disableDelete: true,
      });
    }
  }

  handleSubmit() {
    const { projectName, projectDescription } = this.state;
    const {
      updateProject,
      match: {
        params: { projectID },
      },
    } = this.props;
    const projectInfo = JSON.parse(localStorage.getItem("project"));
    const { name, description } = projectInfo;

    const trimmed = (input) => input.trim();
    const trimprojectName = trimmed(projectName);
    const trimprojectDescription = trimmed(projectDescription);

    if (trimprojectName !== name || trimprojectDescription !== description) {
      if (!trimprojectName || !trimprojectDescription) {
        this.setState({
          error: "Please provide either a new name or description",
        });
      } else {
        if (
          trimprojectName !== name &&
          trimprojectDescription === description
        ) {
          const nameCheckResult = this.checkProjectName(trimprojectName);
          if (nameCheckResult !== "") {
            this.setState({
              error: nameCheckResult,
            });
          } else {
            const newProject = { name: trimprojectName };
            updateProject(projectID, newProject);
          }
        } else if (
          trimprojectName === name &&
          trimprojectDescription !== description
        ) {
          const newProject = { description: trimprojectDescription };
          updateProject(projectID, newProject);
        } else if (
          trimprojectName !== name &&
          trimprojectDescription !== description
        ) {
          const nameCheckResult = this.checkProjectName(trimprojectName);
          if (nameCheckResult !== "") {
            this.setState({
              error: nameCheckResult,
            });
          } else {
            const newProject = {
              name: trimprojectName,
              description: trimprojectDescription,
            };
            updateProject(projectID, newProject);
          }
        }
      }
    } else {
      this.setState({
        error: "Please provide either a new name or description",
      });
    }
  }

  handleDeleteProject(e, projectID) {
    const { deleteProject } = this.props;
    e.preventDefault();
    deleteProject(projectID);
  }

  showUpdateAlert() {
    this.setState({ openUpdateAlert: true });
  }

  showDeleteAlert() {
    this.setState({ openDeleteAlert: true });
  }
  checkProjectName(name) {
    if (!this.validateProjectName(name)) {
      return "Name should start with a letter";
    } else if (this.validateProjectName(name) === "false_convention") {
      return "Name may only contain letters and a hypen -";
    } else if (name.length > 22) {
      return "Project name cannot exceed 22 characters";
    } else {
      return "";
    }
  }

  hideUpdateAlert() {
    this.setState({ openUpdateAlert: false });
  }

  hideDeleteAlert() {
    const { clearDeleteProjectState } = this.props;
    clearDeleteProjectState();
    this.setState({ openDeleteAlert: false });
  }
  renderRedirect = () => {
    const { isDeleted, isUpdated } = this.props;
    if (isDeleted || isUpdated) {
      return <Redirect to={`/projects`} noThrow />;
    }
  };

  render() {
    const {
      match: { params },
      isDeleting,
      isDeleted,
      isUpdating,
      message,
      isFailed,
      isUpdated,
      errorMessage,
    } = this.props;
    const projectInfo = JSON.parse(localStorage.getItem("project"));
    const name = projectInfo.name;
    const description = projectInfo.description;
    const {
      openUpdateAlert,
      openDeleteAlert,
      projectName,
      projectDescription,
      error,
      Confirmprojectname,
      disableDelete,
    } = this.state;

    const { projectID } = params;

    return (
      <div className={styles.Page}>
        {isUpdated || isDeleted ? this.renderRedirect() : null}
        <div className={styles.TopBarSection}>
          <Header />
        </div>
        <div className={styles.MainSection}>
          <div className={styles.SideBarSection}>
            <SideBar
              name={name}
              params={params}
              description={description}
              pageRoute={this.props.location.pathname}
              allMetricsLink={`/projects/${projectID}/metrics`}
              cpuLink={`/projects/${projectID}/cpu/`}
              memoryLink={`/projects/${projectID}/memory/`}
              databaseLink={`/projects/${projectID}/databases`}
              networkLink={`/projects/${projectID}/network/`}
            />
          </div>
          <div className={styles.MainContentSection}>
            <div className={styles.InformationBarSection}>
              <InformationBar header="Settings" />
            </div>
            <div className={styles.ContentSection}>
              <div className={styles.ProjectSections}>
                <div className={styles.ProjectSectionTitle}>Manage project</div>
                <div className={styles.ProjectInstructions}>
                  <div className={styles.ProjectButtonRow}>
                    <div className="flexa">
                      <div>
                        <strong>Update project</strong>
                      </div>
                      <div>Modify the project name and description</div>
                    </div>
                    <div className={styles.SectionButtons}>
                      <SettingsButton
                        label="Update this project"
                        onClick={this.showUpdateAlert}
                      />
                    </div>
                  </div>
                  <div className={styles.ProjectButtonRow}>
                    <div className="flexa">
                      <div>
                        <strong>Delete project</strong>
                      </div>
                      <div>
                        Take down your entire project, delete all apps under it.
                      </div>
                    </div>
                    <div className={styles.SectionButtons}>
                      <SettingsButton
                        label="Delete this project"
                        className="Change-Btn"
                        onClick={this.showDeleteAlert}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {openUpdateAlert && (
                <div className={styles.ProjectDeleteModel}>
                  <Modal
                    showModal={openUpdateAlert}
                    onClickAway={this.hideUpdateAlert}
                  >
                    <div>
                      <div
                        onSubmit={(e) => {
                          this.handleSubmit();
                          e.preventDefault();
                        }}
                      >
                        <div className={styles.UpdateForm}>
                          <div className={styles.DeleteDescription}>
                            Project name
                          </div>
                          <BlackInputText
                            placeholder="Project Name"
                            name="projectName"
                            value={projectName}
                            onChange={(e) => {
                              this.handleChange(e);
                            }}
                          />
                          <div className={styles.DeleteDescription}>
                            Project description
                          </div>
                          <TextArea
                            placeholder="Description"
                            name="projectDescription"
                            value={projectDescription}
                            onChange={(e) => {
                              this.handleChange(e);
                            }}
                          />
                          {(errorMessage || error) && (
                            <Feedback
                              type="error"
                              message={
                                errorMessage
                                  ? "Failed to update Project"
                                  : error
                              }
                            />
                          )}
                          <div className={styles.UpdateProjectModelButtons}>
                            <PrimaryButton
                              label="cancel"
                              className="CancelBtn"
                              onClick={this.hideUpdateAlert}
                            />
                            <PrimaryButton
                              label={
                                isUpdating ? <Spinner /> : "update project"
                              }
                              onClick={this.handleSubmit}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Modal>
                </div>
              )}

              {openDeleteAlert && (
                <div className={styles.ProjectDeleteModel}>
                  <Modal
                    showModal={openDeleteAlert}
                    onClickAway={this.hideDeleteAlert}
                  >
                    <div className={styles.DeleteProjectModel}>
                      <div className={styles.DeleteProjectModalUpperSection}>
                        <div className={styles.WarningContainer}>
                          <div className={styles.DeleteDescription}>
                            Are you sure you want to delete&nbsp;
                            <span>{name}</span>
                            &nbsp;?
                          </div>
                          <div className={styles.DeleteSubDescription}>
                            This will permanently delete the project and all its
                            resources. Please confirm by typing &nbsp;
                            <b className={styles.DeleteWarning}>{name}</b>{" "}
                            &nbsp; below.
                          </div>
                          <div className={styles.InnerModalDescription}>
                            <BlackInputText
                              required
                              placeholder={name}
                              name="Confirmprojectname"
                              value={Confirmprojectname}
                              onChange={(e) => {
                                this.handleChange(e);
                              }}
                            />
                            <DeleteWarning textAlignment="Left" />
                          </div>
                        </div>
                      </div>
                      <div className={styles.DeleteProjectModalLowerSection}>
                        <div className={styles.DeleteProjectModelButtons}>
                          <PrimaryButton
                            label="cancel"
                            className="CancelBtn"
                            onClick={this.hideDeleteAlert}
                          />
                          <PrimaryButton
                            label={isDeleting ? <Spinner /> : "Delete"}
                            className={
                              disableDelete
                                ? styles.InactiveDelete
                                : styles.DeleteBtn
                            }
                            disable={disableDelete}
                            onClick={(e) =>
                              this.handleDeleteProject(e, params.projectID)
                            }
                          />
                        </div>

                        {isFailed && message && (
                          <Feedback message={message} type="error" />
                        )}
                      </div>
                    </div>
                  </Modal>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ProjectSettingsPage.propTypes = {
  isFailed: PropTypes.bool,
  clearDeleteProjectState: PropTypes.func.isRequired,
  updateProject: PropTypes.func.isRequired,
  deleteProject: PropTypes.func.isRequired,
  name: PropTypes.string,
  isUpdating: PropTypes.bool,
  description: PropTypes.string,
  message: PropTypes.string,
  isUpdated: PropTypes.bool,
  isDeleted: PropTypes.bool,
};

ProjectSettingsPage.defaultProps = {
  message: "",
  isUpdated: false,
  isDeleted: false,
  name: "",
  description: "",
  isUpdating: false,
};

const mapStateToProps = (state) => {
  const { isDeleting, isDeleted, isFailed, clearDeleteProjectState, message } =
    state.deleteProjectReducer;

  const { isUpdated, isUpdating, errorMessage, clearUpdateProjectState } =
    state.updateProjectReducer;
  return {
    isUpdated,
    isUpdating,
    message,
    isDeleting,
    isFailed,
    isDeleted,
    errorMessage,
    clearDeleteProjectState,
    clearUpdateProjectState,
  };
};

const mapDispatchToProps = {
  deleteProject,
  updateProject,
  clearDeleteProjectState,
  clearUpdateProjectState,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectSettingsPage);
