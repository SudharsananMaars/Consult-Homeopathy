import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Edit2, RotateCcw, Sparkles, Check } from "lucide-react";
import axios from "axios";
import config from "../../config";

const API_URL = config.API_URL;

const ToggleSwitch = ({ isOn, handleToggle }) => (
  <div
    onClick={handleToggle}
    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 cursor-pointer ${
      isOn ? "bg-blue-500" : "bg-gray-300"
    }`}
  >
    <span
      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
        isOn ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </div>
);

ToggleSwitch.propTypes = {
  isOn: PropTypes.bool.isRequired,
  handleToggle: PropTypes.func.isRequired,
};

const DragDots = () => (
  <div className="flex flex-col items-center justify-center cursor-move text-gray-400 hover:text-gray-600 gap-0.5">
    <div className="flex gap-0.5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-1 h-1 bg-current rounded-full"></div>
      ))}
    </div>
    <div className="flex gap-0.5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-1 h-1 bg-current rounded-full"></div>
      ))}
    </div>
  </div>
);

const FeedbackPanel = () => {
  const [useCases, setUseCases] = useState([]);

  const [selectedUseCase, setSelectedUseCase] = useState("");
  const [afterXHours, setAfterXHours] = useState("");
  const [xHours, setXHours] = useState(5);
  const [feedbackPurpose, setFeedbackPurpose] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [feedbackName, setFeedbackName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // const [questions, setQuestions] = useState([
  //   "How satisfied are you with the overall consultation experience?",
  //   "How would you rate the clarity of the doctors explanations?",
  //   "How well did the doctor address your concerns or questions?",
  //   "How satisfied are you with the response time from the clinic?",
  //   "How likely are you to recommend our services to others?",
  // ]);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

  const generateFeedbackQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/doctorAppointmentSettings/generateDoctorFeedbackQuestions`,
        {
          messengerUsecase: selectedUseCase,
          purpose: feedbackPurpose,
          totalQuestions,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.output) {
        setFeedbackName(response.data.output.feedbackName);
        setQuestions(response.data.output.questions.map((q) => q.question));
      }
    } catch (error) {
      console.error("Error generating feedback questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const isGenerateDisabled =
    !selectedUseCase || !feedbackPurpose || !totalQuestions || loading;

  const regenerateQuestion = async (
    oldQuestion,
    questionIndex,
    messengerUseCase,
    feedbackPurpose
  ) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/doctorAppointmentSettings/regenerateParticularQuestion`,
        {
          oldQuestion: oldQuestion,
          questionId: questionIndex,
          messengerUseCase,
          feedbackPurpose,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.regeneratedQuestions) {
        setQuestions((prev) =>
          prev.map((q, i) =>
            i === questionIndex ? response.data.regeneratedQuestions : q
          )
        );
      }
    } catch (error) {
      console.error("Error regenerating question:", error);
      throw error;
    }
  };

  const getMessengerUseCase = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/doctorAppointmentSettings/getFeedbackPanel`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUseCases(response.data.result);
    } catch (error) {
      console.error("Error fetching feedback panel:", error);
      throw error;
    }
  };

  const updateMessageUseCase = async (id) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/doctorAppointmentSettings/editFeedbackPanel/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data) {
        setUseCases((prev) =>
          prev.map((uc) =>
            uc._id === id
              ? { ...uc, isAvailable: response.data.data.isAvailable }
              : uc
          )
        );
      }
    } catch (error) {
      console.log("Error updating feedback option:", error);
      throw error;
    }
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditingText(questions[index]);
  };

  const handleSave = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = editingText;
    setQuestions(updatedQuestions);
    setEditingIndex(null);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") handleSave(index);
    else if (e.key === "Escape") setEditingIndex(null);
  };

  const createDoctorFeedback = async () => {
    try {
      const payload = {
        messengerUsecase: selectedUseCase,
        purpose: feedbackPurpose,
        totalQuestions: totalQuestions,
        afterXhours: afterXHours === "immediate" ? 0 : xHours, 
        feedbackName: feedbackName,
        questions: questions.map((q) => ({ question: q })),
      };

      const response = await axios.post(
        `${API_URL}/api/doctorAppointmentSettings/createDoctorFeedback`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data) {
        setSelectedUseCase("");
        setFeedbackPurpose("");
        setTotalQuestions(0);
        setAfterXHours(""); 
        setXHours(1);
        setFeedbackName("");
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error creating doctor feedback:", error);
      throw error;
    }
  };

  useEffect(() => {
    getMessengerUseCase();
  }, []);

  return (
    <div className="bg-gray-50 mt-10">
      <div className="border rounded-xl shadow-lg bg-white p-6 space-y-8">
        <h2 className="text-xl font-bold text-gray-800">Feedback Panel</h2>

        <div className="border rounded-lg shadow-sm bg-white">
          <div className="bg-blue-500 text-white font-bold p-3 rounded-t-lg flex justify-between items-center text-base">
            <span className="font-bold text-base">Messenger Use Case</span>
            <span className="font-bold text-base">On / Off</span>
          </div>
          <div className="divide-y divide-gray-200">
            {useCases.map((useCase) => (
              <div
                key={useCase._id}
                className="flex justify-between items-center p-4"
              >
                <span className="text-gray-700 font-semibold text-sm">
                  {useCase.msgUseCase}
                </span>
                <ToggleSwitch
                  isOn={useCase.isAvailable}
                  handleToggle={() => updateMessageUseCase(useCase._id)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 border rounded-lg shadow-sm bg-white p-6 space-y-4">
            {/* Messenger Use Case */}
            <select
              value={selectedUseCase}
              onChange={(e) => setSelectedUseCase(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white font-bold text-sm"
            >
              <option value="">Select Messenger Use Case</option>
              {useCases
                .filter((uc) => uc.isAvailable)
                .map((uc) => (
                  <option key={uc._id} value={uc.msgUseCase}>
                    {uc.msgUseCase}
                  </option>
                ))}
            </select>

            {/* Feedback Purpose */}
            <textarea
              value={feedbackPurpose}
              onChange={(e) => setFeedbackPurpose(e.target.value)}
              placeholder="Feedback Purpose"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-semibold text-sm resize-none"
            />

            {/* Total Questions */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-bold text-gray-700 w-32">
                Total Questions
              </label>
              <select
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white font-bold text-sm"
              >
                {[...Array(10).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={afterXHours}
              onChange={(e) => setAfterXHours(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white font-bold text-sm"
            >
              <option value="immediate">Immediate after closure</option>
              <option value="after">After X hours</option>
            </select>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-bold text-gray-700 w-32">
                X hours
              </label>
              <select
                value={xHours}
                onChange={(e) => setXHours(Number(e.target.value))}
                disabled={afterXHours !== "after"}
                className={`flex-1 p-3 border rounded-md shadow-sm font-bold text-sm
            ${
              afterXHours !== "after"
                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            }`}
              >
                {[...Array(24).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end">
              <button
                onClick={generateFeedbackQuestions}
                disabled={isGenerateDisabled}
                className={`font-bold py-3 px-6 rounded-md transition-colors flex items-center gap-2 shadow-sm text-sm
            ${
              isGenerateDisabled
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-yellow-400 text-white hover:bg-yellow-500"
            }`}
              >
                <Sparkles className="w-4 h-3 text-white" />
                {loading ? "Generating..." : "Generate Questions"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 border rounded-lg bg-white">
            <div className="bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center">
              <span className="font-bold text-base">
                {feedbackName || "Feedback Name"}
              </span>
              <span className="font-bold text-base">Edit / Recreate</span>
            </div>

            {/* Questions Section */}
            {questions.length > 0 ? (
              <div className="divide-y divide-gray-200 h-80 overflow-y-auto">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <DragDots />
                    <div className="flex-1">
                      {editingIndex === index ? (
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="w-full border border-gray-300 rounded-md p-2 text-sm font-semibold focus:ring-blue-500 focus:border-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span className="text-gray-800 text-sm font-semibold">
                          <span className="font-bold text-gray-600">
                            Q{index + 1}:
                          </span>{" "}
                          {question}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {editingIndex === index ? (
                        <button
                          onClick={() => handleSave(index)}
                          className="text-gray-500 hover:text-green-600 transition-colors"
                        >
                          <Check size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditClick(index)}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          regenerateQuestion(
                            question,
                            index,
                            selectedUseCase,
                            feedbackPurpose
                          )
                        }
                        className="text-gray-500 hover:text-green-600 transition-colors mr-10"
                      >
                        <RotateCcw size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center max-h-80 h-80 text-gray-500 font-semibold text-sm">
                Generate questions to display...
              </div>
            )}

            {/* Create Button */}
            <div className="flex justify-end p-4 pb-0 pt-5">
              <button
                disabled={questions.length === 0}
                onClick={createDoctorFeedback}
                className={`font-bold py-3 px-6 rounded-md transition-colors flex items-center gap-2 shadow-sm text-sm
            ${
              questions.length === 0
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-yellow-400 text-white hover:bg-green-500"
            }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPanel;
