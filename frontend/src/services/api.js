const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


export const askAI = async (projectContext, question) => {
  try {
    const res = await fetch(`${BASE_URL}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectContext, question })
    });
    return await res.json();
  } catch (e) { return { success: false, error: e.message }; }
};

export const getAICostOptimizations = async (projectContext, costData) => {
  try {
    const res = await fetch(`${BASE_URL}/ai/cost-optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectContext, costData })
    });
    return await res.json();
  } catch (e) { return { success: false, error: e.message }; }
};

export const getAINextStageTip = async (projectContext, completedStage, nextStage) => {
  try {
    const res = await fetch(`${BASE_URL}/ai/next-stage-tip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectContext, completedStage, nextStage })
    });
    return await res.json();
  } catch (e) { return { success: false, error: e.message }; }
};

export const loginUser = async (phoneNumber, name, city) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, name, city })
    });
    return await res.json();
  } catch (error) {
    console.error('Login Error:', error);
    return { success: false, error: error.message };
  }
};

export const saveProject = async (userId, formData, apiData) => {
  try {
    const res = await fetch(`${BASE_URL}/plots/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, formData, apiData })
    });
    return await res.json();
  } catch (error) {
    console.error('Save Error:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProjects = async (userId) => {
  try {
    const res = await fetch(`${BASE_URL}/plots/${userId}`);
    return await res.json();
  } catch (error) {
    console.error('Fetch Projects Error:', error);
    return { success: false, error: error.message };
  }
};

export const updateMilestone = async (plotId, milestoneId, completed) => {
  try {
    const res = await fetch(`${BASE_URL}/plots/${plotId}/milestone`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneId, completed })
    });
    return await res.json();
  } catch (error) {
    console.error('Milestone Update Error:', error);
    return { success: false, error: error.message };
  }
};

export const submitMasterPlan = async (formData) => {
  try {
    // 1. Calculate BOM and Costs
    const costRes = await fetch(`${BASE_URL}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const costData = await costRes.json();

    // 2. Vastu Correction
    const vastuRes = await fetch(`${BASE_URL}/vastu-correct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Sending empty so it falls back to mock rooms
    });
    const vastuData = await vastuRes.json();

    // 3. Local Suppliers
    const supplierRes = await fetch(`${BASE_URL}/suppliers-near-me`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: formData.city })
    });
    const supplierData = await supplierRes.json();

    return {
      success: true,
      costData,
      vastuData,
      supplierData
    };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message };
  }
};
